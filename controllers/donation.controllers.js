import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	GET_DONATION_SUCCESS,
	DONATION_CREATED_SUCCESS,
	DONATION_UPDATED_SUCCESS,
	DONATION_DELETED_SUCCESS,
	PAYMENT_CONFIRMED_SUCCESS,
} from '../constants';
import { DonationService } from '../services';
import { successResponse } from '../utils';

export const getAllDonations = asyncHandler(async (req, res) => {
	const donationService = new DonationService(req);
	const data = await donationService.getAllDonations();

	return successResponse(res, HttpStatus.OK, GET_DONATION_SUCCESS, data);
});

export const getDonation = asyncHandler(async (req, res) => {
	const donationService = new DonationService(req);
	const data = await donationService.getDonation();

	return successResponse(res, HttpStatus.OK, GET_DONATION_SUCCESS, data);
});

export const createDonation = asyncHandler(async (req, res) => {
	const donationService = new DonationService(req);
	const data = await donationService.createDonation();

	return successResponse(res, HttpStatus.OK, DONATION_CREATED_SUCCESS, data);
});

export const updateDonation = asyncHandler(async (req, res) => {
	const donationService = new DonationService(req);
	const data = await donationService.updateDonation();

	return successResponse(res, HttpStatus.OK, DONATION_UPDATED_SUCCESS, data);
});

export const deleteDonation = asyncHandler(async (req, res) => {
	const donationService = new DonationService(req);
	const data = await donationService.deleteDonation();

	return successResponse(res, HttpStatus.OK, DONATION_DELETED_SUCCESS, data);
});

export const deleteManyDonation = asyncHandler(async (req, res) => {
	const donationService = new DonationService(req);
	const data = await donationService.deleteManyDonation();

	return successResponse(res, HttpStatus.OK, DONATION_DELETED_SUCCESS, data);
});

export const createDonationWithIntent = asyncHandler(async (req, res) => {
	const donationService = new DonationService(req);
	const data = await donationService.createDonationWithIntent();

	return successResponse(res, HttpStatus.OK, DONATION_CREATED_SUCCESS, data);
});

export const confirmPayment = asyncHandler(async (req, res) => {
	const donationService = new DonationService(req);
	const data = await donationService.confirmPayment();

	return successResponse(res, HttpStatus.OK, PAYMENT_CONFIRMED_SUCCESS, data);
});
