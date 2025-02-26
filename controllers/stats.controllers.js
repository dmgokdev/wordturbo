import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import { GET_STATS_SUCCESS } from '../constants';
import { StatsService } from '../services';
import { successResponse } from '../utils';

export const getAllStats = asyncHandler(async (req, res) => {
	const statsService = new StatsService(req);
	const data = await statsService.getStats();

	return successResponse(res, HttpStatus.OK, GET_STATS_SUCCESS, data);
});

export const getOverallStats = asyncHandler(async (req, res) => {
	const statsService = new StatsService(req);
	const data = await statsService.getOverallStats();

	return successResponse(res, HttpStatus.OK, GET_STATS_SUCCESS, data);
});
