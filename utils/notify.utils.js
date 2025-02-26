import path from 'path';
import { fileURLToPath } from 'url';

import { PrismaClient } from '@prisma/client';
import ejs from 'ejs';

import { sendEmail } from './email.utils';
import {
	SUPPORT_EMAIL,
	// FACEBOOK_URL,
	// INSTAGRAM_URL,
	// TWITTER_URL,
	// LINKEIN_URL,
	LIVE_URL,
} from '../config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function sendEmailNotification(user, data, template) {
	const templatePath = path.join(__dirname, '../templates', `${template}.ejs`);
	const formattedHtml = await ejs.renderFile(templatePath, {
		data: {
			SUPPORT_EMAIL,
			// FACEBOOK_URL,
			// INSTAGRAM_URL,
			// TWITTER_URL,
			// LINKEIN_URL,
			LIVE_URL,
			...data,
		},
	});

	const mailOptions = {
		to: user.email,
		subject: data.subject ?? 'Trusty Feed Message',
		html: formattedHtml,
	};
	sendEmail(mailOptions);
}

async function createAppNotification(user, message, type) {
	await prisma.notifications.create({
		data: {
			user_id: user.id,
			type,
			message,
		},
	});
}

export async function notification(
	user,
	type = 'app',
	data = {},
	template = 'message',
) {
	if (type === 'mail') {
		await sendEmailNotification(user, data, template);
	} else {
		await createAppNotification(
			user,
			data.message ?? 'User Notification',
			type,
		);
	}
}
