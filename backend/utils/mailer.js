const nodemailer = require("nodemailer");

let transporter;

const hasSmtpConfig = () =>
	Boolean(
		process.env.SMTP_HOST &&
			process.env.SMTP_PORT &&
			process.env.SMTP_USER &&
			process.env.SMTP_PASS &&
			process.env.SMTP_FROM,
	);

const getTransporter = () => {
	if (!hasSmtpConfig()) {
		return null;
	}

	if (!transporter) {
		transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT),
			secure: process.env.SMTP_SECURE === "true",
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
		});
	}

	return transporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
	const activeTransporter = getTransporter();
	if (!activeTransporter) {
		return false;
	}

	await activeTransporter.sendMail({
		from: process.env.SMTP_FROM,
		to,
		subject,
		text,
		html,
	});

	return true;
};

module.exports = { sendEmail };
