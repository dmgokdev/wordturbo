import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	INTEGER_ERROR,
	REQUIRED_FIELDS,
	INVALID_GAME_ID,
	GAME_ALREADY_EXIST,
	GET_GAME_QUERY_SCHEMA_CONFIG,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const getGameSchema = yup.object({
	query: createQueryParamsSchema(GET_GAME_QUERY_SCHEMA_CONFIG),
});

export const addGameSchema = yup.object({
	body: yup.object({
		name: yup
			.string()
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: GAME_ALREADY_EXIST,
				async test(value) {
					const record = await prisma.games.findFirst({
						where: {
							is_deleted: false,
							name: value,
						},
					});
					return !record || !record.id ? Boolean(1) : Boolean(0);
				},
			}),
		description: yup.string().notRequired(),
	}),
});

export const updateGameSchema = yup.object({
	body: yup.object({
		name: yup
			.string()
			.notRequired()
			.test({
				name: 'valid-form',
				message: GAME_ALREADY_EXIST,
				async test(value) {
					if (!value) return true;
					const { id } = this.options.params;
					const record = await prisma.games.findFirst({
						where: {
							is_deleted: false,
							name: value,
							id: {
								not: parseInt(id, 10),
							},
						},
					});
					return !record || !record.id ? Boolean(1) : Boolean(0);
				},
			}),
		description: yup.string().notRequired(),
	}),
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_GAME_ID,
				async test(value) {
					const record = await prisma.games.findUnique({
						where: {
							is_deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const GameIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_GAME_ID,
				async test(value) {
					const record = await prisma.games.findUnique({
						where: {
							is_deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const deleteGamesSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});
