const bcrypt = require("bcryptjs"); // Use bcryptjs to avoid compilation issues on Windows
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendEmail } = require("../utils/mailer");
const dotenv = require("dotenv");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Helper to create Token
const generateToken = (id) => {
	console.log("Token generated for user:", id);
	return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
};

const validatePassword = (password) => {
	const issues = [];

	if (password.length < 8) issues.push("At least 8 characters.");
	if (password.length > 64) issues.push("At most 64 characters.");
	if (!/[a-z]/.test(password)) issues.push("At least one lowercase letter.");
	if (!/[A-Z]/.test(password)) issues.push("At least one uppercase letter.");
	if (!/[0-9]/.test(password)) issues.push("At least one number.");
	if (!/[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/`~]/.test(password)) {
		issues.push("At least one special character.");
	}
	if (/\s/.test(password)) issues.push("No spaces.");
	return issues;
};

const generateResetToken = () => {
	return crypto.randomBytes(20).toString("hex");
};

const generateVerificationToken = () => {
	return crypto.randomBytes(20).toString("hex");
};

const buildVerificationUrl = (email, token) => {
	const clientBase = process.env.CLIENT_URL || "http://localhost:5173";
	return `${clientBase}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
};

const buildPasswordResetUrl = (email, token) => {
	const clientBase = process.env.CLIENT_URL || "http://localhost:5173";
	return `${clientBase}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
};

const setEmailVerificationDetails = (user) => {
	const verificationToken = generateVerificationToken();
	const hashedToken = crypto
		.createHash("sha256")
		.update(verificationToken)
		.digest("hex");

	user.emailVerificationToken = hashedToken;
	user.emailVerificationExpires = Date.now() + 60 * 60 * 1000;

	return verificationToken;
};

const sendVerificationEmail = async (user, verificationUrl) => {
	const subject = "Verify your email - Rakshak Welfare";
	const text = `Welcome to Rakshak Welfare.\n\nPlease verify your email using this link:\n${verificationUrl}\n\nThis link expires in 1 hour.`;
	const html = `
		<p>Welcome to Rakshak Welfare.</p>
		<p>Please verify your email using this link:</p>
		<p><a href="${verificationUrl}">${verificationUrl}</a></p>
		<p>This link expires in 1 hour.</p>
	`;

	return sendEmail({
		to: user.email,
		subject,
		text,
		html,
	});
};

const sendPasswordResetEmail = async (user, resetUrl) => {
	const subject = "Reset your password - Rakshak Welfare";
	const text = `We received a request to reset your password.\n\nReset link:\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, you can ignore this email.`;
	const html = `
		<p>We received a request to reset your password.</p>
		<p>Use this link to set a new password:</p>
		<p><a href="${resetUrl}">${resetUrl}</a></p>
		<p>This link expires in 1 hour.</p>
		<p>If you did not request this, you can ignore this email.</p>
	`;

	return sendEmail({
		to: user.email,
		subject,
		text,
		html,
	});
};

exports.forgotPassword = async (req, res) => {
	try {
		const email = req.body.email?.trim().toLowerCase();
		if (!email) {
			return res
				.status(400)
				.json({ error: "Please provide your email address." });
		}

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(200).json({
				success: true,
				message: "If the account exists, a password reset email has been sent.",
			});
		}

		const resetToken = generateResetToken();
		const hashedToken = crypto
			.createHash("sha256")
			.update(resetToken)
			.digest("hex");

		user.passwordResetToken = hashedToken;
		user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
		await user.save({ validateBeforeSave: false });

		const resetUrl = buildPasswordResetUrl(email, resetToken);
		const emailSent = await sendPasswordResetEmail(user, resetUrl);

		if (!emailSent) {
			if (process.env.NODE_ENV !== "production") {
				return res.status(200).json({
					success: true,
					message:
						"Mail service not configured. Use this development-only reset link.",
					resetUrl,
				});
			}
			return res.status(503).json({
				error:
					"Password reset service is temporarily unavailable. Please try again later.",
			});
		}

		return res.status(200).json({
			success: true,
			message: "If the account exists, a password reset email has been sent.",
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.resetPassword = async (req, res) => {
	try {
		const email = req.body.email?.trim().toLowerCase();
		const token = req.body.token?.trim();
		const password = req.body.password;
		if (!email || !token || !password) {
			return res
				.status(400)
				.json({ error: "Email, token, and new password are required." });
		}

		const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

		const user = await User.findOne({
			email,
			passwordResetToken: hashedToken,
			passwordResetExpires: { $gt: Date.now() },
		});

		if (!user) {
			return res
				.status(400)
				.json({ error: "Invalid or expired password reset token." });
		}

		const passwordIssues = validatePassword(password);
		if (passwordIssues.length) {
			return res.status(400).json({
				error: "Weak password",
				details: passwordIssues,
			});
		}

		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(password, salt);
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save();

		const authToken = generateToken(user._id);
		res.cookie("token", authToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		res.status(200).json({
			success: true,
			message: "Password reset successful. You are now logged in.",
			token: authToken,
			user: { id: user._id, name: user.name },
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.register = async (req, res) => {
	try {
		// 1. Destructure all fields needed for the User model
		const {
			name,
			email,
			password,
			governmentId,
			governmentIdType,
			familyId,
			age,
			gender,
			caste,
			annualIncome,
			state,
			district,
			documentsHeld,
		} = req.body;
		const normalizedEmail = email?.trim().toLowerCase();

		// 2. Check if user already exists (Email or Aadhaar)
		const existingUser = await User.findOne({
			$or: [{ email: normalizedEmail }, { governmentId }],
		});

		if (existingUser) {
			return res.status(400).json({
				error: "Registration failed: Email or Government ID already in use.",
			});
		}

		// 3. Validate password strength
		const passwordIssues = validatePassword(password);
		if (passwordIssues.length) {
			return res.status(400).json({
				error: "Weak password",
				details: passwordIssues,
			});
		}

		// 4. Hash the password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		const normalizedDocumentsHeld = Array.isArray(documentsHeld)
			? documentsHeld
					.filter((doc) => typeof doc === "string")
					.map((doc) => doc.trim())
					.filter(Boolean)
			: [];

		// Auto-add government ID document based on type
		const documentsSet = new Set(normalizedDocumentsHeld);
		if (governmentIdType === "Aadhaar") documentsSet.add("Aadhaar Card");
		if (governmentIdType === "PAN") documentsSet.add("PAN Card");
		if (governmentIdType === "Voter ID") documentsSet.add("Voter ID");
		const finalDocumentsHeld = Array.from(documentsSet);

		// 5. Create user as unverified
		const user = new User({
			name,
			email: normalizedEmail,
			password: hashedPassword,
			governmentId,
			familyId,
			age,
			gender,
			caste,
			annualIncome,
			state,
			district,
			documentsHeld: finalDocumentsHeld,
		});
		const verificationToken = setEmailVerificationDetails(user);
		await user.save();

		const verificationUrl = buildVerificationUrl(user.email, verificationToken);
		const emailSent = await sendVerificationEmail(user, verificationUrl);

		const response = {
			success: true,
			message:
				"Registration successful. Please verify your email before logging in.",
			emailSent,
		};

		res.status(201).json(response);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.verifyEmail = async (req, res) => {
	try {
		const token =
			req.body.token?.trim() ||
			req.query.token?.trim() ||
			req.params.token?.trim();

		if (!token) {
			return res.status(400).json({ error: "Verification token is required." });
		}

		const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
		const user = await User.findOne({
			emailVerificationToken: hashedToken,
			emailVerificationExpires: { $gt: Date.now() },
		});

		if (!user) {
			return res
				.status(400)
				.json({ error: "Invalid or expired email verification token." });
		}

		user.isEmailVerified = true;
		user.emailVerificationToken = undefined;
		user.emailVerificationExpires = undefined;
		await user.save({ validateBeforeSave: false });

		res.status(200).json({
			success: true,
			message: "Email verified successfully. You can now log in.",
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.resendVerification = async (req, res) => {
	try {
		const email = req.body.email?.trim().toLowerCase();
		if (!email) {
			return res.status(400).json({ error: "Email is required." });
		}

		const user = await User.findOne({ email });
		if (!user || user.isEmailVerified) {
			return res.status(200).json({
				success: true,
				message: "If that account exists, a verification email has been sent.",
			});
		}

		const verificationToken = setEmailVerificationDetails(user);
		await user.save({ validateBeforeSave: false });

		const verificationUrl = buildVerificationUrl(user.email, verificationToken);
		const emailSent = await sendVerificationEmail(user, verificationUrl);

		const response = {
			success: true,
			message: "If that account exists, a verification email has been sent.",
			emailSent,
		};

		res.status(200).json(response);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.login = async (req, res) => {
	try {
		const email = req.body.email?.trim().toLowerCase();
		const { password } = req.body;

		const user = await User.findOne({ email });
		// We use a generic message so hackers don't know if the email exists or not
		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res.status(401).json({ error: "Invalid credentials" });
		}
		if (!user.isEmailVerified) {
			return res.status(403).json({
				error:
					"Email not verified. Please verify your email before logging in.",
			});
		}

		const token = generateToken(user._id);

		// Set HTTP-Only cookie
		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production", // Use secure in production
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		res.status(200).json({
			success: true,
			token,
			user: { id: user._id, name: user.name },
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.logout = (req, res) => {
	res.clearCookie("token", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
	});

	res.status(200).json({
		success: true,
		message: "Logged out successfully",
	});
};
