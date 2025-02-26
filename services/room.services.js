import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';

import { GAME_TIME, GAME_ENTRY, GAME_TOTAL_PLAYER } from '../config';
import {
	ROOM_NOT_FOUND,
	PLAYER_NOT_FOUND,
	INVALID_ROOM_CODE,
} from '../constants';
import { AppError } from '../errors';
import {
	endGame,
	startGame,
	gameResign,
	// getUserPoints,
	findNextPlayer,
	updateRoomBoard,
} from '../utils';

const prisma = new PrismaClient();

export class RoomService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllRooms() {
		const { query } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				is_deleted: false,
			},
		};

		if (search) {
			options.where.AND = Object.keys(search).map(key => {
				if (key === 'game_id' || key === 'created_by') {
					return {
						[key]: search[key],
					};
				}
				return {
					[key]: { contains: search[key] },
				};
			});
		}
		if (sort) {
			const [field, direction] = sort.split(':');
			options.orderBy = [
				{
					[field]: direction,
				},
			];
		}

		const totalCount = await prisma.rooms.count(options);

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;
		options.include = {
			players: {
				include: {
					user: {
						select: { name: true, email: true, image: true },
					},
				},
			},
			creator: {
				select: { name: true, email: true, image: true },
			},
			game: true,
		};

		const allRecords = await prisma.rooms.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(ROOM_NOT_FOUND, HttpStatus.NOT_FOUND, allRecords);

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getRoom() {
		const { id } = this.req.params;
		const record = await prisma.rooms.findUnique({
			where: {
				is_deleted: false,
				id: parseInt(id, 10),
			},
			include: {
				players: {
					include: {
						user: {
							select: { name: true, email: true, image: true },
						},
					},
					orderBy: { score: 'desc' },
				},
				creator: {
					select: { name: true, email: true, image: true },
				},
				game: true,
			},
		});
		if (!record || !record.id)
			throw new AppError(ROOM_NOT_FOUND, HttpStatus.NOT_FOUND);

		return record;
	}

	async generateRoomCode() {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const codeLength = 6;
		let roomCode;
		let isUnique = false;

		while (!isUnique) {
			roomCode = '';
			for (let i = 0; i < codeLength; i += 1) {
				const randomIndex = Math.floor(Math.random() * characters.length);
				roomCode += characters[randomIndex];
			}

			const existingRoom = await prisma.rooms.findUnique({
				where: {
					room_code: roomCode,
				},
			});

			if (!existingRoom) {
				isUnique = true;
			}
		}

		return roomCode;
	}

	async joinRoom() {
		const { user } = this.req;

		// const userPoints = await getUserPoints(user.id);

		// if (userPoints <= 0)
		// throw new AppError('Not enough points', HttpStatus.NOT_FOUND);

		const options = {
			where: {
				is_full: false,
			},
			orderBy: {
				created_at: 'asc',
			},
			include: {
				game: true,
				players: {
					include: {
						user: {
							select: {
								name: true,
								email: true,
								image: true,
							},
						},
					},
				},
			},
		};

		if (this.req?.params?.room_code) {
			options.where.room_code = this.req.params.room_code;
		} else {
			options.where.type = 'public';
		}

		let room = await prisma.rooms.findFirst(options);

		if (this.req?.params?.room_code && (!room || room.is_full))
			throw new AppError(INVALID_ROOM_CODE, HttpStatus.BAD_REQUEST);

		if (!room) {
			const game = await prisma.games.create({
				data: {
					created_by: user.id,
					status: 'waiting',
				},
			});
			const roomCode = await this.generateRoomCode();
			room = await prisma.rooms.create({
				data: {
					game_id: game.id,
					room_code: roomCode,
					is_full: false,
					created_by: user.id,
					entry_points: parseInt(GAME_ENTRY, 10),
				},
			});
		}

		const existingPlayer = await prisma.players.findFirst({
			where: {
				user_id: user.id,
				room_id: room.id,
			},
		});

		if (existingPlayer) {
			// throw new AppError(
			// 	'You are already in this room',
			// 	HttpStatus.BAD_REQUEST,
			// 	room,
			// );
			startGame(room.id, user.id);
			return room;
		}

		await prisma.players.create({
			data: {
				user_id: user.id,
				room_id: room.id,
				game_id: room.game_id,
			},
		});

		await prisma.points_log.create({
			data: {
				description: 'Join a Game',
				user_id: user.id,
				room_id: room.id,
				out: room.entry_points,
			},
		});

		const allPlayers = await prisma.players.findMany({
			where: {
				room_id: room.id,
			},
			include: {
				user: {
					select: {
						name: true,
						email: true,
						image: true,
					},
				},
			},
		});
		room.players = allPlayers;

		if (allPlayers.length === parseInt(GAME_TOTAL_PLAYER, 10)) {
			room.is_full = true;
			await prisma.rooms.update({
				where: {
					id: room.id,
				},
				data: {
					is_full: true,
				},
			});
			room.game = await prisma.games.update({
				where: { id: room.game_id },
				data: {
					status: 'active',
					start_time: new Date(),
					end_time: new Date(
						new Date().getTime() + parseInt(GAME_TIME, 10) * 60 * 1000,
					),
				},
			});
			await prisma.players.update({
				where: {
					id: allPlayers[0].id,
				},
				data: {
					status: 'playing',
				},
			});
			startGame(room.id);
		}

		return { room };
	}

	async updateRoom() {
		const { id } = this.req.params;
		const { body } = this.req;

		const updateRecord = await prisma.rooms.update({
			where: {
				is_deleted: false,
				id: parseInt(id, 10),
			},
			data: body,
		});

		return updateRecord;
	}

	async deleteRoom() {
		const { id } = this.req.params;

		await prisma.rooms.update({
			where: {
				is_deleted: false,
				id: parseInt(id, 10),
			},
			data: {
				is_deleted: true,
			},
		});

		return null;
	}

	async deleteManyRoom() {
		const { ids } = this.req.body;

		await prisma.rooms.updateMany({
			where: {
				id: {
					in: ids,
				},
			},
			data: {
				is_deleted: true,
			},
		});

		return null;
	}

	async handlePlayerTurn() {
		const { user, body } = this.req;
		// const { id } = this.req.params;
		const { room_id: roomID, score, found_word: word, time, fixedChars } = body;

		const room = await prisma.rooms.findUnique({
			where: {
				id: parseInt(roomID, 10),
				is_deleted: false,
				status: 'active',
			},
			include: {
				game: true,
				players: {
					include: {
						user: {
							select: {
								name: true,
								email: true,
								image: true,
								socket: true,
							},
						},
					},
					orderBy: { id: 'asc' },
					where: {
						status: {
							notIn: ['resigned'],
						},
					},
				},
			},
		});

		if (
			!room?.players ||
			!Array.isArray(room.players) ||
			room.players.length === 0
		)
			throw new AppError(PLAYER_NOT_FOUND, HttpStatus.NOT_FOUND);

		const currentPlayingIndex = room.players.findIndex(
			player => player.user_id === user.id && player.status === 'playing',
		);

		if (currentPlayingIndex === -1)
			throw new AppError('Not your turn!', HttpStatus.NOT_FOUND);

		if (fixedChars) {
			await prisma.rooms.update({
				where: { id: roomID },
				data: {
					board: JSON.stringify(fixedChars),
				},
			});
		}

		const currentPlayer = room.players[currentPlayingIndex];

		// Update current player's status and score
		await prisma.players.update({
			where: { id: currentPlayer.id },
			data: {
				status: 'waiting',
				score: currentPlayer.score + parseInt(score, 10),
				...(time ? { remaining_time: time } : {}),
			},
		});

		// Insert player's score if applicable
		if (score > 0) {
			await prisma.player_score.create({
				data: {
					player_id: currentPlayer.id,
					user_id: user.id,
					room_id: currentPlayer.room_id,
					game_id: currentPlayer.game_id,
					found_word: word,
					score: parseInt(score, 10),
					...(time ? { turn_time: time } : {}),
				},
			});
		}

		const nextPlayer = await findNextPlayer(currentPlayingIndex, room);

		if (!nextPlayer)
			throw new AppError('Game ended Successfully', HttpStatus.NOT_FOUND);

		// Update next player's status
		await prisma.players.update({
			where: { id: nextPlayer.id },
			data: { status: 'playing' },
		});

		updateRoomBoard(roomID, true);
		return true;
	}

	async resignRoom() {
		const { user } = this.req;
		const { id } = this.req.params;

		const player = await prisma.players.findFirst({
			where: {
				user_id: user.id,
				room_id: parseInt(id, 10),
			},
		});

		if (!player || !player.id)
			throw new AppError(PLAYER_NOT_FOUND, HttpStatus.NOT_FOUND);

		await prisma.players.update({
			where: {
				id: player.id,
			},
			data: {
				status: 'resigned',
				score: -1,
			},
		});

		gameResign(player);

		return null;
	}

	async roomTimeUp() {
		const { user } = this.req;
		const { id } = this.req.params;

		const player = await prisma.players.findFirst({
			where: {
				user_id: user.id,
				room_id: parseInt(id, 10),
			},
		});

		if (!player || !player.id)
			throw new AppError(PLAYER_NOT_FOUND, HttpStatus.NOT_FOUND);

		await prisma.players.update({
			where: {
				id: player.id,
			},
			data: {
				status: 'time_up',
			},
		});

		const players = await prisma.players.count({
			where: {
				game_id: parseInt(player.game_id, 10),
				room_id: parseInt(player.room_id, 10),
				status: {
					notIn: ['resigned', 'time_up'],
				},
			},
		});

		if (players > 0) {
			gameResign(player);
		} else {
			endGame(player.room_id);
		}

		return true;
	}
}
