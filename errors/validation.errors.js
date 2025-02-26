export class ValidationError extends Error {
	constructor(errors) {
		super('Validation Error');
		this.statusCode = 400;
		this.errors = errors;
		this.isOperational = true;
		Error.captureStackTrace(this, this.constructor);
		Object.setPrototypeOf(this, ValidationError.prototype);
	}
}
