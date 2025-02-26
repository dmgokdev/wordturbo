import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	GET_ROOM_SUCCESS,
	ROOM_RESIGN_SUCCESS,
	ROOM_CREATED_SUCCESS,
	ROOM_UPDATED_SUCCESS,
	ROOM_DELETED_SUCCESS,
} from '../constants';
import { RoomService } from '../services';
import { successResponse } from '../utils';

export const getAllRooms = asyncHandler(async (req, res) => {
	const roomService = new RoomService(req);
	const data = await roomService.getAllRooms();

	return successResponse(res, HttpStatus.OK, GET_ROOM_SUCCESS, data);
});

export const getRoom = asyncHandler(async (req, res) => {
	const roomService = new RoomService(req);
	const data = await roomService.getRoom();

	return successResponse(res, HttpStatus.OK, GET_ROOM_SUCCESS, data);
});

export const joinRoom = asyncHandler(async (req, res) => {
	const roomService = new RoomService(req);
	const data = await roomService.joinRoom();

	return successResponse(res, HttpStatus.OK, ROOM_CREATED_SUCCESS, data);
});

export const handlePlayerTurn = asyncHandler(async (req, res) => {
	const roomService = new RoomService(req);
	const data = await roomService.handlePlayerTurn();

	return successResponse(res, HttpStatus.OK, 'Score saved Successfully', data);
});

export const updateRoom = asyncHandler(async (req, res) => {
	const roomService = new RoomService(req);
	const data = await roomService.updateRoom();

	return successResponse(res, HttpStatus.OK, ROOM_UPDATED_SUCCESS, data);
});

export const resignRoom = asyncHandler(async (req, res) => {
	const roomService = new RoomService(req);
	const data = await roomService.resignRoom();

	return successResponse(res, HttpStatus.OK, ROOM_RESIGN_SUCCESS, data);
});

export const roomTimeUp = asyncHandler(async (req, res) => {
	const roomService = new RoomService(req);
	const data = await roomService.roomTimeUp();

	return successResponse(res, HttpStatus.OK, 'Time UP', data);
});

export const deleteRoom = asyncHandler(async (req, res) => {
	const roomService = new RoomService(req);
	const data = await roomService.deleteRoom();

	return successResponse(res, HttpStatus.OK, ROOM_DELETED_SUCCESS, data);
});

export const deleteManyRoom = asyncHandler(async (req, res) => {
	const roomService = new RoomService(req);
	const data = await roomService.deleteManyRoom();

	return successResponse(res, HttpStatus.OK, ROOM_DELETED_SUCCESS, data);
});
