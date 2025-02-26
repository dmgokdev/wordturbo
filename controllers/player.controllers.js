import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	GET_PLAYER_SUCCESS,
	PLAYER_CREATED_SUCCESS,
	PLAYER_UPDATED_SUCCESS,
	PLAYER_DELETED_SUCCESS,
} from '../constants';
import { PlayerService } from '../services';
import { successResponse } from '../utils';

export const getAllPlayers = asyncHandler(async (req, res) => {
	const playerService = new PlayerService(req);
	const data = await playerService.getAllPlayers();

	return successResponse(res, HttpStatus.OK, GET_PLAYER_SUCCESS, data);
});

export const getPlayer = asyncHandler(async (req, res) => {
	const playerService = new PlayerService(req);
	const data = await playerService.getPlayer();

	return successResponse(res, HttpStatus.OK, GET_PLAYER_SUCCESS, data);
});

export const createPlayer = asyncHandler(async (req, res) => {
	const playerService = new PlayerService(req);
	const data = await playerService.createPlayer();

	return successResponse(res, HttpStatus.OK, PLAYER_CREATED_SUCCESS, data);
});

export const updatePlayer = asyncHandler(async (req, res) => {
	const playerService = new PlayerService(req);
	const data = await playerService.updatePlayer();

	return successResponse(res, HttpStatus.OK, PLAYER_UPDATED_SUCCESS, data);
});

export const deletePlayer = asyncHandler(async (req, res) => {
	const playerService = new PlayerService(req);
	const data = await playerService.deletePlayer();

	return successResponse(res, HttpStatus.OK, PLAYER_DELETED_SUCCESS, data);
});

export const deleteManyPlayer = asyncHandler(async (req, res) => {
	const playerService = new PlayerService(req);
	const data = await playerService.deleteManyPlayer();

	return successResponse(res, HttpStatus.OK, PLAYER_DELETED_SUCCESS, data);
});
