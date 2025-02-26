import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';

import { ROLE_NOT_FOUND } from '../constants';
import { AppError } from '../errors';

const prisma = new PrismaClient();

export class RoleService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllRoles() {
		const { query } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				deleted: false,
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

		const totalCount = await prisma.roles.count(options);

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;

		const allRecords = await prisma.roles.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND, allRecords);

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getRole() {
		const { id } = this.req.params;
		const record = await prisma.roles.findUnique({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
		});
		if (!record || !record.id)
			throw new AppError(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND);
		return record;
	}

	async createRole() {
		const { body } = this.req;

		const record = await prisma.roles.create({
			data: {
				...body,
			},
		});

		return { record };
	}

	async updateRole() {
		const { id } = this.req.params;
		const { body } = this.req;

		const updateRecord = await prisma.roles.update({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
			data: body,
		});

		return updateRecord;
	}

	async deleteRole() {
		const { id } = this.req.params;

		await prisma.roles.update({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
			data: {
				deleted: true,
			},
		});

		return null;
	}

	async deleteManyRole() {
		const { ids } = this.req.body;

		await prisma.roles.updateMany({
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
