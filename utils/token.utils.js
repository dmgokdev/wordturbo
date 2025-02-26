import HttpStatus from 'http-status-codes';
import jwt from 'jsonwebtoken';

// import { computeSHA256Hash } from './hash.utils';
import {
	ACCESS_TOKEN_EXPIRY,
	ACCESS_TOKEN_SECRET,
	OTP_TOKEN_SECRET,
	OTP_TOKEN_EXPIRY,
	// REFRESH_TOKEN_EXPIRY,
	// REFRESH_TOKEN_SECRET,
	// FORGOT_TOKEN_SECRET,
	// FORGOT_TOKEN_EXPIRY,
} from '../config';
import { INVALID_TOKEN } from '../constants';
import { AppError } from '../errors';

function createToken(secret, expiry, payload) {
	return jwt.sign(payload, secret, { expiresIn: expiry });
}

function verifyToken(token, secret) {
	return new Promise((resolve, reject) => {
		jwt.verify(token, secret, (err, payload) => {
			if (err) reject(new AppError(INVALID_TOKEN, HttpStatus.UNAUTHORIZED));
			resolve(payload);
		});
	});
}

export const createAccessToken = payload => {
	return createToken(ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY, payload);
};

export const createOtpToken = payload => {
	return createToken(OTP_TOKEN_SECRET, OTP_TOKEN_EXPIRY, payload);
};

// export const createRefreshToken = payload => {
// 	return createToken(REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRY, payload);
// };

// export const createForgotToken = payload => {
// 	return createToken(FORGOT_TOKEN_SECRET, FORGOT_TOKEN_EXPIRY, payload);
// };
// export const verifyForgotToken = token => {
// 	return verifyToken(token, FORGOT_TOKEN_SECRET);
// };

export const verifyAccessToken = token => {
	return verifyToken(token, ACCESS_TOKEN_SECRET);
};

export const verifyOtpToken = token => {
	return verifyToken(token, OTP_TOKEN_SECRET);
};

// export const verifyRefreshToken = token => {
// 	return verifyToken(token, REFRESH_TOKEN_SECRET);
// };

// export const isRefreshTokenValid = (userToken, token) => {
// 	const hash = computeSHA256Hash(token);
// 	return userToken === hash;
// };
