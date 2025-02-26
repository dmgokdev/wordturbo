import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';

import {
	GAME_NOT_FOUND,
	PLAYER_NOT_FOUND,
	GAME_ALREADY_STARTED,
} from '../constants';
import { AppError } from '../errors';
import { gameResign, findNextPlayer, updateRoomBoard, endGame } from '../utils';

const prisma = new PrismaClient();

export class GameService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllGames() {
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
			options.where.AND = Object.keys(search).map(key => ({
				[key]: { contains: search[key] },
			}));
		}
		if (sort) {
			const [field, direction] = sort.split(':');
			options.orderBy = [
				{
					[field]: direction,
				},
			];
		}

		const totalCount = await prisma.games.count(options);

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
			room: true,
		};

		const allRecords = await prisma.games.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(GAME_NOT_FOUND, HttpStatus.NOT_FOUND, allRecords);

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getGame() {
		const { id } = this.req.params;
		const record = await prisma.games.findUnique({
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
				},
				creator: {
					select: { name: true, email: true, image: true },
				},
				room: true,
			},
		});
		if (!record || !record.id)
			throw new AppError(GAME_NOT_FOUND, HttpStatus.NOT_FOUND);
		return record;
	}

	async startGame() {
		const { id } = this.req.params;
		const record = await prisma.games.findUnique({
			where: {
				is_deleted: false,
				id: parseInt(id, 10),
			},
		});
		if (!record || !record.id)
			throw new AppError(GAME_NOT_FOUND, HttpStatus.NOT_FOUND);

		if (record.start_time !== null)
			throw new AppError(GAME_ALREADY_STARTED, HttpStatus.BAD_REQUEST);

		const updatedRecord = await prisma.games.update({
			where: { id: record.id },
			data: {
				status: 'active',
				start_time: new Date(),
				end_time: new Date(new Date().getTime() + 5 * 60 * 1000),
			},
		});

		return { record: updatedRecord };
	}

	async gameTimeUp() {
		const { user } = this.req;
		const { id } = this.req.params;

		const player = await prisma.players.findFirst({
			where: {
				user_id: user.id,
				game_id: parseInt(id, 10),
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

	async resignGame() {
		const { user } = this.req;
		const { id } = this.req.params;

		const player = await prisma.players.findFirst({
			where: {
				user_id: user.id,
				game_id: parseInt(id, 10),
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

	async updateGame() {
		const { id } = this.req.params;
		const { body } = this.req;

		const updateRecord = await prisma.games.update({
			where: {
				is_deleted: false,
				id: parseInt(id, 10),
			},
			data: body,
		});

		return updateRecord;
	}

	async deleteGame() {
		const { id } = this.req.params;

		await prisma.games.update({
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

	async deleteManyGame() {
		const { ids } = this.req.body;

		await prisma.games.updateMany({
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
}
