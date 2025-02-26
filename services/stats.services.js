import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class StatsService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	async getStats() {
		const { query } = this.req;
		const { game, user, room } = query;

		const stats = await prisma.players.groupBy({
			where: {
				game_id: parseInt(game, 10) || undefined,
				user_id: parseInt(user, 10) || undefined,
				room_id: parseInt(room, 10) || undefined,
			},
			by: ['user_id'],
			_sum: {
				score: true,
			},
			orderBy: {
				_sum: {
					score: 'desc',
				},
			},
		});

		const userIds = stats.map(stat => stat.user_id);

		const users = await prisma.users.findMany({
			where: {
				id: {
					in: userIds,
				},
			},
			select: {
				id: true,
				name: true,
				email: true,
			},
		});

		const detailedStats = stats.map(stat => {
			const userInfo = users.find(u => u.id === stat.user_id);
			return {
				user_id: stat.user_id,
				name: userInfo?.name || null,
				email: userInfo?.email || null,
				score: stat._sum.score || 0,
			};
		});

		return detailedStats;
	}

	async getOverallStats() {
		// const { user } = this.req;

		const result = await prisma.$queryRaw`
			SELECT 
				p.user_id, 
				u.name,
				u.email,
				u.image,
				(SUM(p.inn) - SUM(p.out)) AS totalPoints 
			FROM points_log p
			JOIN users u ON p.user_id = u.id
			GROUP BY p.user_id, u.name, u.email, u.image
			ORDER BY totalPoints DESC;
		`;
			// ORDER BY p.totalPoints DESC;

		return result;
	}
}
