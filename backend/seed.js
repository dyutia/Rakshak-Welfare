const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Scheme = require("./models/Scheme"); // Ensure path is correct

dotenv.config();

const schemes = [
	{
		name: "PM-Kisan Samman Nidhi",
		department: "Department of Agriculture and Farmers Welfare",
		state: "Central", // Use "Central" for schemes available nationwide
		description:
			"Financial benefit of ₹6,000 per year to all landholding farmer families.",
		eligibility: {
			ageMin: 18,
			ageMax: 100,
			gender: "All",
			caste: ["General", "OBC", "SC", "ST"], // List individual castes instead of "All"
			annualIncomeLimit: 200000,
			residencyRequired: false,
		},
		applicationLink: "https://pmkisan.gov.in/",
		isActive: true,
	},
	{
		name: "Ayushman Bharat (PM-JAY)",
		department: "National Health Authority",
		state: "Central",
		description:
			"Health cover of ₹5 Lakhs per family per year for secondary and tertiary care.",
		eligibility: {
			ageMin: 0,
			ageMax: 100,
			gender: "All",
			caste: ["General", "OBC", "SC", "ST", "EWS"],
			annualIncomeLimit: 500000,
			residencyRequired: false,
		},
		applicationLink: "https://dashboard.pmjay.gov.in/",
		isActive: true,
	},
	{
		name: "Majhi Ladli Behna Yojana",
		department: "Women and Child Development Department",
		state: "Maharashtra",
		description: "Monthly financial assistance for women in Maharashtra.",
		eligibility: {
			ageMin: 21,
			ageMax: 65,
			gender: "Female",
			caste: ["General", "OBC", "SC", "ST", "EWS"],
			annualIncomeLimit: 250000,
			residencyRequired: true,
		},
		applicationLink: "https://ladlibehna.maharashtra.gov.in/",
		isActive: true,
	},
];

const seedDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("Connected to Atlas for seeding...");

		// 1. Wipe current data to avoid duplicates
		await Scheme.deleteMany({});
		console.log("Cleared existing schemes.");

		// 2. Insert new data
		await Scheme.insertMany(schemes);
		console.log(`${schemes.length} actual government schemes added!`);

		mongoose.connection.close();
		console.log("Database connection closed.");
	} catch (error) {
		console.error("Seeding error:", error);
		process.exit(1);
	}
};

seedDB();
