import { rateLimit } from 'express-rate-limit';

import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW } from '../config';
import { TOO_MANY_REQUESTS } from '../constants';

export const rateLimiter = rateLimit({
	windowMs: RATE_LIMIT_WINDOW * 60 * 1000,
	max: RATE_LIMIT_MAX,
	standardHeaders: true,
	legacyHeaders: true,
	message: TOO_MANY_REQUESTS,
});
