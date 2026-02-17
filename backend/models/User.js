const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		// Identity
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
		},
		governmentId: {
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
	},
	{ timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
