import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	GET_GAME_SUCCESS,
	GAME_RESIGN_SUCCESS,
	GAME_STARTED_SUCCESS,
	GAME_UPDATED_SUCCESS,
	GAME_DELETED_SUCCESS,
} from '../constants';
import { GameService } from '../services';
import { successResponse } from '../utils';

export const getAllGames = asyncHandler(async (req, res) => {
	const gameService = new GameService(req);
	const data = await gameService.getAllGames();

	return successResponse(res, HttpStatus.OK, GET_GAME_SUCCESS, data);
});

export const getGame = asyncHandler(async (req, res) => {
	const gameService = new GameService(req);
	const data = await gameService.getGame();

	return successResponse(res, HttpStatus.OK, GET_GAME_SUCCESS, data);
});

export const resignGame = asyncHandler(async (req, res) => {
	const gameService = new GameService(req);
	const data = await gameService.resignGame();

	return successResponse(res, HttpStatus.OK, GAME_RESIGN_SUCCESS, data);
});

export const startGame = asyncHandler(async (req, res) => {
	const gameService = new GameService(req);
	const data = await gameService.startGame();

	return successResponse(res, HttpStatus.OK, GAME_STARTED_SUCCESS, data);
});

export const gameTimeUp = asyncHandler(async (req, res) => {
	const gameService = new GameService(req);
	const data = await gameService.gameTimeUp();

	return successResponse(res, HttpStatus.OK, 'Time UP', data);
});

export const updateGame = asyncHandler(async (req, res) => {
	const gameService = new GameService(req);
	const data = await gameService.updateGame();

	return successResponse(res, HttpStatus.OK, GAME_UPDATED_SUCCESS, data);
});

export const deleteGame = asyncHandler(async (req, res) => {
	const gameService = new GameService(req);
	const data = await gameService.deleteGame();

	return successResponse(res, HttpStatus.OK, GAME_DELETED_SUCCESS, data);
});

export const deleteManyGame = asyncHandler(async (req, res) => {
	const gameService = new GameService(req);
	const data = await gameService.deleteManyGame();

	return successResponse(res, HttpStatus.OK, GAME_DELETED_SUCCESS, data);
});
