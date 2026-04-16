const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const auditRoutes = require("./routes/auditRoutes");
const schemeRoutes = require("./routes/schemeRoutes");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");
const Scheme = require("./models/Scheme");

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

// Auto-seed schemes if none exist
const autoSeedSchemes = async () => {
	try {
		const count = await Scheme.countDocuments();
		if (count === 0) {
			console.log("No schemes found. Seeding database...");
			const schemes = [
				{
					name: "PM-Kisan Samman Nidhi",
					department: "Department of Agriculture and Farmers Welfare",
					state: "Central",
					description:
						"Financial benefit of Rs 6,000 per year to all landholding farmer families.",
					eligibility: {
						age: {
							min: 18,
							max: 100,
						},
						gender: "All",
						caste: ["General", "OBC", "SC", "ST"],
						incomeLimit: 200000,
						residencyRequired: false,
					},
					requiredDocuments: [
						{ docName: "Aadhaar Card", isMandatory: true },
						{ docName: "Land Records", isMandatory: true },
						{ docName: "Bank Passbook", isMandatory: true },
					],
					applicationLink: "https://pmkisan.gov.in/",
					isActive: true,
				},
				{
					name: "Ayushman Bharat (PM-JAY)",
					department: "National Health Authority",
					state: "Central",
					description:
						"Health cover of Rs 5 Lakhs per family per year for secondary and tertiary care.",
					eligibility: {
						age: {
							min: 0,
							max: 100,
						},
						gender: "All",
						caste: ["General", "OBC", "SC", "ST", "EWS"],
						incomeLimit: 500000,
						residencyRequired: false,
					},
					requiredDocuments: [
						{ docName: "Aadhaar Card", isMandatory: true },
						{ docName: "Ration Card", isMandatory: true },
					],
					applicationLink: "https://dashboard.pmjay.gov.in/",
					isActive: true,
				},
				{
					name: "Majhi Ladli Behna Yojana",
					department: "Women and Child Development Department",
					state: "Maharashtra",
					description: "Monthly financial assistance for women in Maharashtra.",
					eligibility: {
						age: {
							min: 22,
							max: 65,
						},
						gender: "Female",
						caste: ["General", "OBC", "SC", "ST", "EWS"],
						incomeLimit: 250000,
						residencyRequired: true,
					},
					requiredDocuments: [
						{ docName: "Aadhaar Card", isMandatory: true },
						{ docName: "Income Certificate", isMandatory: true },
						{ docName: "Domicile Certificate", isMandatory: true },
					],
					applicationLink: "https://ladlibehna.maharashtra.gov.in/",
					isActive: true,
				},
			];
			await Scheme.insertMany(schemes);
			console.log(`${schemes.length} schemes seeded successfully.`);
		} else {
			console.log(`${count} schemes already exist. Skipping seeding.`);
		}
	} catch (error) {
		console.error("Auto-seeding error:", error);
	}
};

// Run auto-seeding after DB connection
setTimeout(autoSeedSchemes, 1000); // Small delay to ensure DB is connected

const app = express();

// Middleware to parse JSON and cookies
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true, // Allow cookies to be sent with requests
	}),
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
