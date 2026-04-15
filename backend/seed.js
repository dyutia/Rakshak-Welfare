const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Scheme = require("./models/Scheme");

dotenv.config();

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
				min: 21,
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

const seedDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("Connected to Atlas for seeding...");

		await Scheme.deleteMany({});
		console.log("Cleared existing schemes.");

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
