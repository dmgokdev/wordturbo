import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import HttpStatus from 'http-status-codes';

import { USER_NOT_FOUND, ACCOUNT_STATUS } from '../constants';
import { AppError } from '../errors';
import { generateRandomString } from '../utils';

const prisma = new PrismaClient();

export class UserService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllUsers(role) {
		const { query } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				deleted: false,
				role,
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

		const totalCount = await prisma.users.count(options);

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;
		options.select = {
			id: true,
			name: true,
			email: true,
			password: false,
			birth_date: true,
			gender: true,
			remember_token: false,
			role: true,
			status: true,
			deleted: true,
			created_by: true,
			created_at: true,
			updated_at: true,
			last_login: true,
			address: true,
			city: true,
			country: true,
			image: true,
			state: true,
			number: true,
			lat_long: true,
			postal_code: true,
		};

		const allRecords = await prisma.users.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(USER_NOT_FOUND, HttpStatus.NOT_FOUND);

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getUser() {
		const { id } = this.req.params;
		const record = await prisma.users.findUnique({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
		});
		return this.publicProfile(record);
	}

	async createUser() {
		const { body, user } = this.req;
		let { password } = body;

		const birthDate = body.birth_date;

		if (!password) {
			password = generateRandomString(6, 20);
		}

		body.password = await bcrypt.hash(password, 12);
		if (birthDate) {
			body.birth_date = new Date(`${birthDate}T00:00:00.000Z`);
		}
		body.status = ACCOUNT_STATUS.ACTIVE;

		body.created_by = user.id;

		const newUser = await prisma.users.create({ data: body });

		return this.publicProfile(newUser);
	}

	async updateUser() {
		const { id } = this.req.params;
		const { body } = this.req;

		const updateRecord = await prisma.users.update({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
			data: body,
		});

		return this.publicProfile(updateRecord);
	}

	async updateManyUser() {
		const { ids, status } = this.req.body;

		const updateRecord = await prisma.users.updateMany({
			where: {
				id: {
					in: ids,
				},
			},
			data: {
				status,
			},
		});

		return updateRecord;
	}

	async deleteUser() {
		const { id } = this.req.params;

		await prisma.users.update({
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

	async deleteManyUser() {
		const { ids } = this.req.body;

		await prisma.users.updateMany({
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

	/* eslint-disable-next-line class-methods-use-this */
	publicProfile(user) {
		const record = { ...user };
		if (!record || !record.id)
			throw new AppError(USER_NOT_FOUND, HttpStatus.NOT_FOUND);

		if (record.password) delete record.password;
		if (record.remember_token) delete record.remember_token;

		return record;
	}
}
