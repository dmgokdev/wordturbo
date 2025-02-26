import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';

import { verifySocket } from '../middlewares/auth.middlewares';

const prisma = new PrismaClient();
let io;

export const initSocket = server => {
	io = new Server(server, {
		cors: {
			origin: '*',
			methods: ['*'],
		},
	});

	io.on('connection', socket => {
		console.log('A user connected');

		socket.on('authenticate', async token => {
			console.log('authenticate');
			try {
				const response = await verifySocket(token);
				if (response?.success) {
					const { user } = response;

					await prisma.socket.upsert({
						where: { user_id: user.id },
						update: { socket_id: socket.id },
						create: { user_id: user.id, socket_id: socket.id },
					});

					console.log(`${user.id} ${user.name} Authenticated`);
				} else {
					socket.emit('error', response?.message ?? 'Unauthorized');
					socket.disconnect();
				}
			} catch (error) {
				socket.disconnect();
			}
		});

		socket.on('disconnect', async () => {
			console.log('User disconnected');

			if (socket.user) {
				console.log(`User ${socket.user.id} disconnected`);

				await prisma.socket.deleteMany({
					where: { user_id: socket.user.id },
				});
			}
		});
	});

	return io;
};

async function emitFn(id, name, data = null) {
	// const io = getIo(); // ✅ Fetch io inside the function to avoid import order issues
	// if (!io) {
	// 	console.warn('Socket.io not initialized, emit ignored');
	// 	return;
	// }

	io.to(id).emit(name, data);
}

async function distributePoints(roomID) {
	const room = await prisma.rooms.findUnique({
		where: {
			id: parseInt(roomID, 10),
			// status: 'active',
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
				orderBy: { score: 'desc' },
				where: {
					status: {
						notIn: ['resigned'],
					},
				},
			},
		},
	});
	const { id: roomId, players, entry_points: entryFee } = room;

	const totalPlayers = await prisma.players.count({
		where: { room_id: parseInt(roomId, 10) },
	});

	if (totalPlayers < 2) {
		return 'Not enough players';
	}

	const totalPool = totalPlayers * entryFee;

	const distribution = {
		2: [1],
		3: [0.6, 0.4],
		4: [0.5, 0.3, 0.2],
		5: [0.45, 0.25, 0.2, 0.1],
		6: [0.4, 0.25, 0.15, 0.1, 0.1],
		7: [0.4, 0.25, 0.15, 0.1, 0.05, 0.05],
		8: [0.35, 0.25, 0.15, 0.1, 0.05, 0.05, 0.05],
	};

	const prizeDistribution = distribution[totalPlayers] || [
		0.35, 0.25, 0.15, 0.1, 0.05, 0.05, 0.05,
	];

	// Process winners
	const updatePromises = players.map(async (player, index) => {
		if (index >= prizeDistribution.length) return null;

		const points = Math.floor(totalPool * prizeDistribution[index]);
		if (points > 0) {
			// Update player points
			await prisma.players.update({
				where: { id: player.id },
				data: { game_points: points },
			});

			// Log points distribution
			await prisma.points_log.create({
				data: {
					description: `Win a game at position ${index + 1}`,
					user_id: player.user_id,
					room_id: roomId,
					inn: points,
				},
			});
		}
		return true;
	});

	await Promise.all(updatePromises);
	return true;
}

export async function endGame(roomID) {
	await distributePoints(roomID);
	const room = await prisma.rooms.findUnique({
		where: {
			id: parseInt(roomID, 10),
			// status: 'active',
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
				orderBy: { score: 'desc' },
				where: {
					status: {
						notIn: ['resigned'],
					},
				},
			},
		},
	});

	await prisma.games.update({
		where: { id: parseInt(room.game_id, 10) },
		data: { status: 'expired' },
	});

	await prisma.rooms.update({
		where: { id: parseInt(roomID, 10) },
		data: { status: 'expired' },
	});

	room.game.status = 'expired';
	room.status = 'expired';

	room.players.forEach(player => {
		const socketId = player?.user?.socket?.[0]?.socket_id;
		if (socketId) {
			// eslint-disable-next-line no-param-reassign
			delete player.user.socket;
			// eslint-disable-next-line no-console
			console.log(
				`Socket Emit for ${player.user.name} ${player.user_id}, Socket Name: endGame`,
			);
			emitFn(socketId, 'endGame', room);
		}
	});
}

export async function startGame(roomID, userID = 0) {
	const room = await prisma.rooms.findUnique({
		where: {
			id: roomID,
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
				...(userID > 0 ? { where: { user_id: userID } } : {}),
			},
		},
	});

	room.players.forEach(player => {
		const socketId = player?.user?.socket?.[0]?.socket_id;
		if (socketId) {
			// eslint-disable-next-line no-param-reassign
			delete player.user.socket;
			// eslint-disable-next-line no-console
			console.log(
				`Socket Emit for ${player.user.name} ${player.user_id}, Socket Name: startGame `,
			);
			emitFn(socketId, 'startGame', room);

			if (player.status === 'playing') {
				setTimeout(() => {
					// eslint-disable-next-line no-console
					console.log(
						`Socket Emit for ${player.user.name} ${player.user_id}, Socket Name: playGame`,
					);
					emitFn(socketId, 'playGame', room);
				}, 1000);
			}
		}
	});
}

export function findNextPlayer(currentPlayingIndex, room) {
	let nextPlayerIndex = currentPlayingIndex;

	const hasTimeUpPlayer = room.players.some(
		player => player.status === 'time_up',
	);

	let foundWaitingPlayer = false;
	let startIndex = (currentPlayingIndex + 1) % room.players.length;

	for (let i = 0; i < room.players.length; i += 1) {
		if (room.players[startIndex].status === 'waiting') {
			nextPlayerIndex = startIndex;
			foundWaitingPlayer = true;
			break;
		}
		startIndex = (startIndex + 1) % room.players.length;
	}

	// If no "waiting" player is found, and no player has time_up status than set nextPlayer to null
	if (!foundWaitingPlayer && !hasTimeUpPlayer) {
		nextPlayerIndex = null;
	}

	const nextPlayer =
		nextPlayerIndex !== null ? room.players[nextPlayerIndex] : false;

	if (!nextPlayer) {
		// eslint-disable-next-line no-console
		console.log(`End Game room_id: ${room.id}, game_id: ${room.game_id}`);
		endGame(room.id);
		return false;
	}
	return nextPlayer;
}

export async function updateRoomBoard(roomID, playGame = false) {
	const room = await prisma.rooms.findUnique({
		where: {
			id: parseInt(roomID, 10),
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

	room.players.forEach(player => {
		const socketId = player?.user?.socket?.[0]?.socket_id;
		if (socketId) {
			// eslint-disable-next-line no-param-reassign
			delete player.user.socket;
			// eslint-disable-next-line no-console
			console.log(
				`Socket Emit for ${player.user.name} ${player.user_id}, Socket Name: boardUpdate `,
			);
			emitFn(socketId, 'boardUpdate', room);

			if (playGame && player.status === 'playing') {
				setTimeout(() => {
					// eslint-disable-next-line no-console
					console.log(
						`Socket Emit for ${player.user.name} ${player.user_id}, Socket Name: playGame`,
					);
					emitFn(socketId, 'playGame', room);
				}, 1000);
			}
		}
	});
}

export async function gameResign(player) {
	const players = await prisma.players.findMany({
		where: {
			room_id: parseInt(player.room_id, 10),
			status: {
				notIn: ['resigned'],
			},
		},
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
	});

	if (players.length <= 1) {
		endGame(player.room_id);
		return false;
	}

	if (player.status !== 'playing') {
		// updateRoomBoard(room_id);
		return false;
	}

	const currentPlayingIndex = players.findIndex(
		singlePlayer => singlePlayer.id === parseInt(player.id, 10),
	);

	const nextPlayer = await findNextPlayer(currentPlayingIndex, {
		id: player.room_id,
		game_id: player.game_id,
		players,
	});

	if (!nextPlayer) {
		return false;
	}

	// Update next player's status
	await prisma.players.update({
		where: { id: nextPlayer.id },
		data: { status: 'playing' },
	});

	updateRoomBoard(player.room_id, true);
	return true;
}
