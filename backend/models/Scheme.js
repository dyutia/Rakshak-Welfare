const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		department: { type: String, required: true, trim: true },
		state: { type: String, required: true, trim: true }, // "Central" for pan-India
		description: { type: String, required: true },

		eligibility: {
			age: {
				min: { type: Number, default: 0 },
				max: { type: Number, default: 120 },
			},
			incomeLimit: { type: Number, default: Infinity },
			gender: {
				type: String,
				enum: ["Male", "Female", "Transgender", "All"],
				default: "All",
			},
			caste: {
				type: [String],
				enum: ["SC", "ST", "OBC", "General", "EWS", "EBC", "Minority"],
				default: ["General"],
			},
			residencyRequired: { type: Boolean, default: true },
		},

		requiredDocuments: [
			{
				docName: { type: String, required: true },
				isMandatory: { type: Boolean, default: true },
			},
		],

		applicationLink: { type: String, trim: true },
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true },
);

// Indexing for faster searching by state and department
schemeSchema.index({ state: 1, department: 1 });

module.exports = mongoose.model("Scheme", schemeSchema);
