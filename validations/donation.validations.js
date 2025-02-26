import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	INTEGER_ERROR,
	REQUIRED_FIELDS,
	INVALID_DONATION_ID,
	DONATION_ALREADY_EXIST,
	GET_DONATION_QUERY_SCHEMA_CONFIG,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const getDonationSchema = yup.object({
	query: createQueryParamsSchema(GET_DONATION_QUERY_SCHEMA_CONFIG),
});

export const addDonationSchema = yup.object({
	body: yup.object({
		name: yup
			.string()
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: DONATION_ALREADY_EXIST,
				async test(value) {
					const record = await prisma.donations.findFirst({
						where: {
							deleted: false,
							name: value,
						},
					});
					return !record || !record.id ? Boolean(1) : Boolean(0);
				},
			}),
		description: yup.string().notRequired(),
	}),
});

export const updateDonationSchema = yup.object({
	body: yup.object({
		name: yup
			.string()
			.notRequired()
			.test({
				name: 'valid-form',
				message: DONATION_ALREADY_EXIST,
				async test(value) {
					if (!value) return true;
					const { id } = this.options.params;
					const record = await prisma.donations.findFirst({
						where: {
							deleted: false,
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
				message: INVALID_DONATION_ID,
				async test(value) {
					const record = await prisma.donations.findUnique({
						where: {
							deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const DonationIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.positive()
			.integer(INTEGER_ERROR)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INVALID_DONATION_ID,
				async test(value) {
					const record = await prisma.donations.findUnique({
						where: {
							deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const deleteDonationsSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});

export const createIntentSchema = yup.object({
	body: yup.object({
		amount: yup.number().required(REQUIRED_FIELDS),
	}),
});

export const confirmPaymentSchema = yup.object({
	body: yup.object({
		paymentIntentId: yup.string().required(REQUIRED_FIELDS),
	}),
});
