import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getUserPoints(userID) {
	const result = await prisma.points_log.aggregate({
		_sum: {
			inn: true,
			out: true,
		},
		where: {
			user_id: userID,
		},
	});

	const totalPoints = (result._sum.inn || 0) - (result._sum.out || 0);
	return totalPoints;
}
