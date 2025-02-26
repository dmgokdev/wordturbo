import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	LOGIN_SUCCESS,
	REGISTER_SUCCESS,
	OTP_VERIFIED,
	OTP_SEND_SUCCESS,
	RESET_SUCCESS,
	GET_USERS_SUCCESS,
} from '../constants';
import { AuthService } from '../services';
import { successResponse } from '../utils';

export const login = asyncHandler(async (req, res) => {
	const authService = new AuthService(req);
	const data = await authService.login();
	return successResponse(res, HttpStatus.OK, LOGIN_SUCCESS, data);
});

export const register = asyncHandler(async (req, res) => {
	const authService = new AuthService(req);
	const data = await authService.register();
	return successResponse(res, HttpStatus.OK, REGISTER_SUCCESS, data);
});

export const OtpVerify = asyncHandler(async (req, res) => {
	const authService = new AuthService(req);
	const data = await authService.OtpVerify();
	return successResponse(res, HttpStatus.OK, OTP_VERIFIED, data);
});

export const ResendOTP = asyncHandler(async (req, res) => {
	const authService = new AuthService(req);
	const data = await authService.ResendOTP();
	return successResponse(res, HttpStatus.OK, OTP_SEND_SUCCESS, data);
});

export const ForgotPassword = asyncHandler(async (req, res) => {
	const authService = new AuthService(req);
	const data = await authService.ForgotPassword();
	return successResponse(res, HttpStatus.OK, OTP_SEND_SUCCESS, data);
});

export const ResetPassword = asyncHandler(async (req, res) => {
	const authService = new AuthService(req);
	const data = await authService.ResetPassword();
	return successResponse(res, HttpStatus.OK, RESET_SUCCESS, data);
});

export const getLoggedInUser = asyncHandler(async (req, res) => {
	const authService = new AuthService(req);
	const data = await authService.getLoggedInUser();
	return successResponse(res, HttpStatus.OK, GET_USERS_SUCCESS, data);
});
