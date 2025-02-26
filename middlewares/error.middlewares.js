import { NODE_ENV } from '../config';
import { AppError } from '../errors';

export const notFound = req => {
	throw new AppError(
		`Requested URL ${req.method}/ ${req.originalUrl} not found`,
		404,
	);
};
export const errorMiddleware = (error, req, res, next) => {
	let statusCode = error.statusCode || 500;
	let message = error.message || 'Unexpected Server error';
	let stack = error.stack || undefined;
	const errors = error.errors || undefined;
	const success = false;
	if (message === 'Validation Error') {
		statusCode = 422;
	}
	if (message.length > 100) {
		message = 'Unexpected Server error';
		stack = null;
	}
	res
		.status(statusCode)
		.json({
			success,
			message,
			status: statusCode,
			...(NODE_ENV === 'development' && { stack }),
			...(errors && { errors }),
		})
		.end();
	next(error);
};
