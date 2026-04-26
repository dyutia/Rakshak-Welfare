const jwt = require("jsonwebtoken");
const User = require("../models/User");
const dotenv = require("dotenv");
const multer = require("multer");
const { performDocumentAudit } = require("../utils/auditService");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const storage = multer.memoryStorage();
const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 },
});

exports.recoveryUpload = upload.single("document");

// Helper to create Token
const generateToken = (id) => {
	console.log("Token generated for user:", id);
	return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
};

exports.register = async (req, res) => {
	try {
		const {
			name,
			phoneNumber,
			aadhaarNumber,
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

		const normalizedPhoneNumber = phoneNumber?.toString().trim();
		const normalizedAadhaarNumber = aadhaarNumber?.toString().trim();

		if (!normalizedPhoneNumber || !/^\d{10}$/.test(normalizedPhoneNumber)) {
			return res.status(400).json({
				error: "phoneNumber is required and must be exactly 10 digits.",
			});
		}

		if (!normalizedAadhaarNumber) {
			return res.status(400).json({ error: "aadhaarNumber is required." });
		}

		// Check if user already exists (Phone or Aadhaar)
		const existingUser = await User.findOne({
			$or: [{ phoneNumber: normalizedPhoneNumber }, { aadhaarNumber: normalizedAadhaarNumber }],
		});

		if (existingUser) {
			return res.status(400).json({
				error: "Registration failed: phoneNumber or aadhaarNumber already in use.",
			});
		}

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

		const user = new User({
			name,
			phoneNumber: normalizedPhoneNumber,
			aadhaarNumber: normalizedAadhaarNumber,
			familyId,
			age,
			gender,
			caste,
			annualIncome,
			state,
			district,
			documentsHeld: finalDocumentsHeld,
		});
		await user.save();

		res.status(201).json({
			success: true,
			message: "Registration successful. Please login to receive an OTP.",
			user: { id: user._id, name: user.name, phoneNumber: user.phoneNumber },
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.login = async (req, res) => {
	try {
		const phoneNumber = req.body.phoneNumber?.toString().trim();

		if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
			return res
				.status(400)
				.json({ error: "phoneNumber is required and must be exactly 10 digits." });
		}

		const user = await User.findOne({ phoneNumber });
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		user.otp = otp;
		user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
		await user.save({ validateBeforeSave: false });

		console.log(`OTP for ${phoneNumber}: ${otp}`);

		res.status(200).json({
			success: true,
			message: "OTP sent (development: check server logs).",
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.verifyOtp = async (req, res) => {
	try {
		const phoneNumber = req.body.phoneNumber?.toString().trim();
		const otp = req.body.otp?.toString().trim();

		if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
			return res
				.status(400)
				.json({ error: "phoneNumber is required and must be exactly 10 digits." });
		}
		if (!otp || !/^\d{6}$/.test(otp)) {
			return res.status(400).json({ error: "otp is required and must be 6 digits." });
		}

		const user = await User.findOne({
			phoneNumber,
			otp,
			otpExpires: { $gt: new Date() },
		});

		if (!user) {
			return res.status(401).json({ error: "Invalid or expired OTP." });
		}

		user.otp = undefined;
		user.otpExpires = undefined;
		await user.save({ validateBeforeSave: false });

		const token = generateToken(user._id);

		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		return res.status(200).json({
			success: true,
			token,
			user: { id: user._id, name: user.name, phoneNumber: user.phoneNumber },
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.requestPhoneRecovery = async (req, res) => {
	try {
		const aadhaarNumber = req.body.aadhaarNumber?.toString().trim();
		const newPhoneNumber = req.body.newPhoneNumber?.toString().trim();

		if (!aadhaarNumber) {
			return res.status(400).json({ error: "aadhaarNumber is required." });
		}
		if (!newPhoneNumber || !/^\d{10}$/.test(newPhoneNumber)) {
			return res
				.status(400)
				.json({ error: "newPhoneNumber is required and must be exactly 10 digits." });
		}
		if (!req.file) {
			return res.status(400).json({ error: "Please upload Aadhaar Card photo." });
		}

		const user = await User.findOne({ aadhaarNumber });
		if (!user) {
			return res.status(404).json({ error: "Account not found for this Aadhaar." });
		}

		const phoneInUse = await User.findOne({
			phoneNumber: newPhoneNumber,
			_id: { $ne: user._id },
		});
		if (phoneInUse) {
			return res.status(400).json({ error: "This phone number is already in use." });
		}

		const audit = await performDocumentAudit(req.file.buffer, user, {
			aadhaarNumber: user.aadhaarNumber,
		});

		user.pendingPhoneNumber = newPhoneNumber;
		user.phoneRecoveryStatus = "pending";
		user.phoneRecoveryRequestedAt = new Date();
		user.phoneRecoveryAudit = audit;
		await user.save({ validateBeforeSave: false });

		return res.status(200).json({
			success: true,
			message:
				"Recovery request submitted. An auditor will review your Aadhaar and link your new phone number.",
			audit,
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
