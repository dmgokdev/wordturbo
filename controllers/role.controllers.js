import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	GET_ROLE_SUCCESS,
	ROLE_CREATED_SUCCESS,
	ROLE_UPDATED_SUCCESS,
	ROLE_DELETED_SUCCESS,
} from '../constants';
import { RoleService } from '../services';
import { successResponse } from '../utils';

export const getAllRoles = asyncHandler(async (req, res) => {
	const roleService = new RoleService(req);
	const data = await roleService.getAllRoles();

	return successResponse(res, HttpStatus.OK, GET_ROLE_SUCCESS, data);
});

export const getRole = asyncHandler(async (req, res) => {
	const roleService = new RoleService(req);
	const data = await roleService.getRole();

	return successResponse(res, HttpStatus.OK, GET_ROLE_SUCCESS, data);
});

export const createRole = asyncHandler(async (req, res) => {
	const roleService = new RoleService(req);
	const data = await roleService.createRole();

	return successResponse(res, HttpStatus.OK, ROLE_CREATED_SUCCESS, data);
});

export const updateRole = asyncHandler(async (req, res) => {
	const roleService = new RoleService(req);
	const data = await roleService.updateRole();

	return successResponse(res, HttpStatus.OK, ROLE_UPDATED_SUCCESS, data);
});

export const deleteRole = asyncHandler(async (req, res) => {
	const roleService = new RoleService(req);
	const data = await roleService.deleteRole();

	return successResponse(res, HttpStatus.OK, ROLE_DELETED_SUCCESS, data);
});

export const deleteManyRole = asyncHandler(async (req, res) => {
	const roleService = new RoleService(req);
	const data = await roleService.deleteManyRole();

	return successResponse(res, HttpStatus.OK, ROLE_DELETED_SUCCESS, data);
});
