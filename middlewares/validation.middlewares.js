import { ValidationError as YupValidationError } from 'yup';

import { ValidationError } from '../errors';

export const validate = schema => async (req, res, next) => {
	try {
		const { query, body, params, file, cookies } = await schema.validate(
			{
				body: req.body,
				query: req.query,
				params: req.params,
				file: req.file,
				cookies: req.cookies,
			},
			{
				abortEarly: false,
				stripUnknown: true,
			},
		);

		req.body = body;
		req.query = query;
		req.params = params;
		req.file = file;
		req.cookies = cookies;

		return next();
	} catch (err) {
		if (!(err instanceof YupValidationError)) return next(err);

		const errors = err.inner.map(e => {
			const path = e.path || 'Unknown field';
			return {
				path,
				message: e.message.startsWith(path)
					? e.message.slice(path.length).trim()
					: e.message,
			};
		});

		return next(new ValidationError(errors));
	}
};
