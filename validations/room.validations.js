import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	INTEGER_ERROR,
	REQUIRED_FIELDS,
	INVALID_ROOM_ID,
	INVALID_ROOM_CODE,
	GET_ROOM_QUERY_SCHEMA_CONFIG,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const getRoomSchema = yup.object({
	query: createQueryParamsSchema(GET_ROOM_QUERY_SCHEMA_CONFIG),
});

export const joinRoomSchema = yup.object({
	params: yup.object({
		room_code: yup
			.string()
			.notRequired()
			.test({
				name: 'valid-form',
				message: INVALID_ROOM_CODE,
				async test(value) {
					if (!value) return true;

					const record = await prisma.rooms.findUnique({
						where: {
							is_full: false,
							room_code: value,
							is_deleted: false,
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const playerTurnSchema = yup.object({
	body: yup.object({
		room_id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_ROOM_ID,
				async test(value) {
					const record = await prisma.rooms.findUnique({
						where: {
							id: parseInt(value, 10),
							is_deleted: false,
							status: 'active',
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
		score: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS),
		found_word: yup.string().required(REQUIRED_FIELDS),
		fixedChars: yup.mixed().notRequired(),
		time: yup.string().required(REQUIRED_FIELDS),
	}),
});

export const RoomIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_ROOM_ID,
				async test(value) {
					const record = await prisma.rooms.findUnique({
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

export const deleteRoomsSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});
