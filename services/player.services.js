import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';

import { PLAYER_NOT_FOUND } from '../constants';
import { AppError } from '../errors';

const prisma = new PrismaClient();

export class PlayerService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllPlayers() {
		const { query } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {},
		};

		if (search) {
			options.where.AND = Object.keys(search).map(key => {
				if (
					key === 'user_id' ||
					key === 'room_id' ||
					key === 'game_id' ||
					key === 'score' ||
					key === 'position'
				) {
					return { [key]: search[key] };
				}
				return { [key]: { contains: search[key] } };
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

		const totalCount = await prisma.players.count(options);

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;
		options.include = {
			user: {
				select: { name: true, email: true, image: true },
			},
			room: true,
			game: true,
		};

		const allRecords = await prisma.players.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(PLAYER_NOT_FOUND, HttpStatus.NOT_FOUND, allRecords);

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getPlayer() {
		const { id } = this.req.params;
		const record = await prisma.players.findUnique({
			where: {
				id: parseInt(id, 10),
			},
			include: {
				user: {
					select: { name: true, email: true, image: true },
				},
				room: true,
				game: true,
			},
		});
		if (!record || !record.id)
			throw new AppError(PLAYER_NOT_FOUND, HttpStatus.NOT_FOUND);
		return record;
	}

	async createPlayer() {
		const { body } = this.req;

		const record = await prisma.players.create({
			data: {
				...body,
			},
		});

		return { record };
	}

	async updatePlayer() {
		const { id } = this.req.params;
		const { body } = this.req;

		const updateRecord = await prisma.players.update({
			where: {
				id: parseInt(id, 10),
			},
			data: body,
		});

		return updateRecord;
	}

	async deletePlayer() {
		const { id } = this.req.params;

		await prisma.players.update({
			where: {
				id: parseInt(id, 10),
			},
			data: {
				deleted: true,
			},
		});

		return null;
	}

	async deleteManyPlayer() {
		const { ids } = this.req.body;

		await prisma.players.updateMany({
			where: {
				id: {
					in: ids,
				},
			},
			data: {
				deleted: true,
			},
		});

		return null;
	}
}
