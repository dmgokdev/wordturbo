import ElasticMail from 'nodelastic';
// import sgMail from '@sendgrid/mail';

import {
	// SG_API_KEY,
	// SG_SENDER_EMAIL,
	SMTP_PASS,
	FROM_NAME,
	FROM_EMAIL,
} from '../config';

// sgMail.setApiKey(SG_API_KEY);

// export const sendEmail = async msg => {
// 	return sgMail.send({ ...msg, from: SG_SENDER_EMAIL });
// };

const client = new ElasticMail(SMTP_PASS);

export const sendEmail = async mailOptions => {
	try {
		client.send({
			from: FROM_EMAIL,
			fromName: FROM_NAME,
			subject: mailOptions.subject,
			msgTo: [mailOptions.to],
			bodyHtml: mailOptions.html,
			textHtml: mailOptions.text,
		});
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('Error sending email:', error);
	}
};
