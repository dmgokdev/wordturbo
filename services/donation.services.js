import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';
import stripePackage from 'stripe';

import { STRIPE_SECRET_KEY } from '../config';
import { DONATION_NOT_FOUND, DONATION_STATUS } from '../constants';
import { AppError } from '../errors';

const prisma = new PrismaClient();
const stripe = stripePackage(STRIPE_SECRET_KEY);

export class DonationService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllDonations() {
		const { query } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				// deleted: false,
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

		const totalCount = await prisma.donations.count(options);

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;

		const allRecords = await prisma.donations.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(DONATION_NOT_FOUND, HttpStatus.NOT_FOUND, allRecords);

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getDonation() {
		const { id } = this.req.params;
		const record = await prisma.donations.findUnique({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
		});
		if (!record || !record.id)
			throw new AppError(DONATION_NOT_FOUND, HttpStatus.NOT_FOUND);
		return record;
	}

	async createDonation() {
		const { body } = this.req;

		const record = await prisma.donations.create({
			data: {
				...body,
			},
		});

		return { record };
	}

	async updateDonation() {
		const { id } = this.req.params;
		const { body } = this.req;

		const updateRecord = await prisma.donations.update({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
			data: body,
		});

		return updateRecord;
	}

	async deleteDonation() {
		const { id } = this.req.params;

		await prisma.donations.update({
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

	async deleteManyDonation() {
		const { ids } = this.req.body;

		await prisma.donations.updateMany({
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

	async createDonationWithIntent() {
		const { body, user } = this.req;
		const { amount } = body;

		const total = amount * 100;
		let customerId;

		const userStripeId = await prisma.user_meta.findFirst({
			where: {
				user_id: user.id,
				key: 'stripe_id',
			},
		});

		if (userStripeId?.value) {
			customerId = userStripeId.value;
		} else {
			const customer = await stripe.customers.create();
			customerId = customer.id;

			await prisma.user_meta.create({
				data: {
					user_id: user.id,
					key: 'stripe_id',
					value: customerId,
				},
			});
		}

		const ephemeralKey = await stripe.ephemeralKeys.create(
			{ customer: customerId },
			{ apiVersion: '2024-04-10' },
		);

		const paymentIntent = await stripe.paymentIntents.create({
			amount: total,
			currency: 'usd',
			customer: customerId,
		});

		const donation = await prisma.donations.create({
			data: {
				amount: total,
				status: total > 0 ? DONATION_STATUS.PENDING : DONATION_STATUS.COMPLETED,
				description: paymentIntent?.id ?? null,
				response: JSON.stringify(paymentIntent) ?? null,
				user_id: user.id,
				reference_id: customerId ?? null,
			},
		});

		return {
			record: donation,
			paymentIntent: paymentIntent?.client_secret,
			ephemeralKey: ephemeralKey?.secret,
			customer: customerId,
			paymentIntentId: paymentIntent?.id,
		};
	}

	async confirmPayment() {
		const { body, user } = this.req;
		const { paymentIntentId } = body;

		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
		if (paymentIntent.status !== 'succeeded')
			throw new AppError(
				`Payment status: ${paymentIntent?.status}`,
				HttpStatus.NOT_FOUND,
			);

		const payment = await prisma.donations.findFirst({
			where: {
				status: DONATION_STATUS.PENDING,
				user_id: user.id,
				description: paymentIntentId,
			},
		});
		if (!payment) throw new AppError(DONATION_NOT_FOUND, HttpStatus.NOT_FOUND);

		const confirmed = await prisma.donations.update({
			where: {
				id: payment.id,
			},
			data: {
				status: DONATION_STATUS.COMPLETED,
			},
		});

		return confirmed;
	}
}
