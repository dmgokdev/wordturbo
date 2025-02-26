import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';

import {
	INVALID_ACCESS_TOKEN,
	NOT_ENOUGH_RIGHTS,
	UNAUTHORIZED,
	USER_NOT_FOUND,
	OTP_NOT_VERIFIED,
} from '../constants';
import { AppError } from '../errors';
import { verifyAccessToken, verifyOtpToken } from '../utils';

const prisma = new PrismaClient();

export const isAuth = async (req, res, next) => {
	try {
		if (!req.headers.authorization)
			throw new AppError(UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
		const token = req.headers.authorization.split(' ')[1];
		const decoded = await verifyAccessToken(token);

		if (!decoded || !decoded.id)
			throw new AppError(INVALID_ACCESS_TOKEN, HttpStatus.UNAUTHORIZED);
		const user = await prisma.users.findUnique({
			where: {
				deleted: false,
				id: decoded.id,
			},
		});
		if (!user || !user.id)
			throw new AppError(UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
		req.user = user;
		next();
	} catch (error) {
		next(error);
	}
};

export const verifySocket = async token => {
	const decoded = await verifyAccessToken(token);

	if (!decoded || !decoded.id)
		return { success: false, message: INVALID_ACCESS_TOKEN };

	const user = await prisma.users.findUnique({
		where: {
			deleted: false,
			id: decoded.id,
		},
	});
	if (!user || !user.id) return { success: false, message: UNAUTHORIZED };

	return { success: true, user };
};

export const resetCheck = async (req, res, next) => {
	try {
		if (!req.headers.authorization)
			throw new AppError(UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
		const token = req.headers.authorization.split(' ')[1];
		const decoded = await verifyOtpToken(token);

		if (!decoded || !decoded.userId)
			throw new AppError(INVALID_ACCESS_TOKEN, HttpStatus.UNAUTHORIZED);
		const user = await prisma.users.findUnique({
			where: {
				deleted: false,
				id: decoded.userId,
				remember_token: token,
			},
		});
		if (!user || !user.id)
			throw new AppError(UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
		req.user = user;
		next();
	} catch (error) {
		next(error);
	}
};

export const checkAuth = async (req, res, next) => {
	try {
		if (req.headers.authorization) {
			const token = req.headers.authorization.split(' ')[1];
			const decoded = await verifyAccessToken(token);

			if (!decoded || !decoded.id)
				throw new AppError(INVALID_ACCESS_TOKEN, HttpStatus.UNAUTHORIZED);
			const user = await prisma.users.findUnique({
				where: {
					deleted: false,
					id: decoded.id,
				},
			});
			if (!user || !user.id)
				throw new AppError(UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
			req.user = user;
		}
		next();
	} catch (error) {
		next(error);
	}
};

export const varifyOTP = async (req, res, next) => {
	try {
		const { otp } = req.body;
		const { id } = req.params;
		const user = await prisma.users.findUnique({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
		});

		if (!user || !user.id || !user.remember_token)
			throw new AppError(USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);

		const decoded = await verifyOtpToken(user.remember_token);

		if (
			!decoded ||
			!decoded.userId ||
			!decoded.OTP ||
			parseInt(decoded.OTP, 10) !== parseInt(otp, 10)
		)
			throw new AppError(OTP_NOT_VERIFIED, HttpStatus.UNAUTHORIZED);

		req.type = decoded.type ? decoded.type : 'verify';
		req.user = user;
		next();
	} catch (error) {
		next(error);
	}
};

export const authorize = roles => {
	return (req, res, next) => {
		if (roles.includes(req.user.role)) return next();
		throw new AppError(NOT_ENOUGH_RIGHTS, HttpStatus.FORBIDDEN);
	};
};
