import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	INTEGER_ERROR,
	REQUIRED_FIELDS,
	INVALID_PLAYER_ID,
	// PLAYER_ALREADY_EXIST,
	GET_PLAYER_QUERY_SCHEMA_CONFIG,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const getPlayerSchema = yup.object({
	query: createQueryParamsSchema(GET_PLAYER_QUERY_SCHEMA_CONFIG),
});

export const updatePlayerSchema = yup.object({
	body: yup.object({
		score: yup.number().required(REQUIRED_FIELDS),
		found_word: yup.string().required(REQUIRED_FIELDS),
	}),
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_PLAYER_ID,
				async test(value) {
					const record = await prisma.players.findUnique({
						where: {
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const PlayerIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_PLAYER_ID,
				async test(value) {
					const record = await prisma.players.findUnique({
						where: {
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const deletePlayersSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});
