const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		// Identity
		name: {
			type: String,
			required: true,
		},
		phoneNumber: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			match: [/^\d{10}$/, "phoneNumber must be exactly 10 digits"],
		},
		otp: {
			type: String,
		},
		otpExpires: {
			type: Date,
		},
		pendingPhoneNumber: {
			type: String,
			trim: true,
			match: [/^\d{10}$/, "pendingPhoneNumber must be exactly 10 digits"],
		},
		phoneRecoveryStatus: {
			type: String,
			enum: ["pending", "approved", "rejected"],
		},
		phoneRecoveryRequestedAt: {
			type: Date,
		},
		phoneRecoveryAudit: {
			isValid: Boolean,
			confidenceScore: Number,
			warnings: [String],
			extractedSnippet: String,
			aadhaarMatched: Boolean,
		},
		aadhaarNumber: {
			type: String,
			required: true,
			unique: true,
		},

		// Profile
		age: {
			type: Number,
		},
		gender: {
			type: String,
			enum: ["Male", "Female", "Transgender"],
		},
		caste: {
			type: String,
			enum: ["SC", "ST", "OBC", "General", "EWS", "EBC", "Minority"],
		},
		annualIncome: {
			type: Number,
		},

		// Location
		state: {
			type: String,
		},
		district: {
			type: String,
		},
		familyId: {
			type: String,
		},

		// Documents
		documentsHeld: [
			{
				type: String,
				trim: true,
			},
		],
		verifiedDocuments: [
			{
				type: String,
				trim: true,
			},
		],
		uploadedDocuments: [
			{
				docType: String,
				fileUrl: String,
				isVerified: {
					type: Boolean,
					default: false,
				},
			},
		],

		// Voice Preferences
		preferredLanguage: {
			type: String,
			enum: ['hi', 'mr', 'bn', 'en', 'ta', 'te', 'gu', 'kn', 'ml', 'pa'],
			default: 'en',
		},
		languageDetected: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
