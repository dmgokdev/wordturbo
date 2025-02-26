import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	GET_USERS_SUCCESS,
	USER_CREATED_SUCCESS,
	USER_UPDATED_SUCCESS,
	USER_DELETED_SUCCESS,
} from '../constants';
import { UserService } from '../services';
import { successResponse } from '../utils';

export const getAllUsers = asyncHandler(async (req, res) => {
	const userService = new UserService(req);
	const data = await userService.getAllUsers('CUSTOMER');

	return successResponse(res, HttpStatus.OK, GET_USERS_SUCCESS, data);
});

export const getUser = asyncHandler(async (req, res) => {
	const userService = new UserService(req);
	const data = await userService.getUser();

	return successResponse(res, HttpStatus.OK, GET_USERS_SUCCESS, data);
});

export const createUser = asyncHandler(async (req, res) => {
	const userService = new UserService(req);
	const data = await userService.createUser();

	return successResponse(res, HttpStatus.OK, USER_CREATED_SUCCESS, data);
});

export const updateUser = asyncHandler(async (req, res) => {
	const userService = new UserService(req);
	const data = await userService.updateUser();

	return successResponse(res, HttpStatus.OK, USER_UPDATED_SUCCESS, data);
});

export const updateManyUser = asyncHandler(async (req, res) => {
	const userService = new UserService(req);
	const data = await userService.updateManyUser();

	return successResponse(res, HttpStatus.OK, USER_UPDATED_SUCCESS, data);
});

export const deleteUser = asyncHandler(async (req, res) => {
	const userService = new UserService(req);
	const data = await userService.deleteUser();

	return successResponse(res, HttpStatus.OK, USER_DELETED_SUCCESS, data);
});

export const deleteManyUser = asyncHandler(async (req, res) => {
	const userService = new UserService(req);
	const data = await userService.deleteManyUser();

	return successResponse(res, HttpStatus.OK, USER_DELETED_SUCCESS, data);
});

export const getAllBrands = asyncHandler(async (req, res) => {
	const userService = new UserService(req);
	const data = await userService.getAllUsers('BRAND');

	return successResponse(res, HttpStatus.OK, GET_USERS_SUCCESS, data);
});
