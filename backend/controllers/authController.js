const bcrypt = require("bcryptjs"); // Use bcryptjs to avoid compilation issues on Windows
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;

// Helper to create Token
const generateToken = (id) => {
	return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
};

exports.register = async (req, res) => {
	try {
		// 1. Destructure all fields needed for the User model
		const {
			name,
			email,
			password,
			governmentId,
			familyId,
			age,
			gender,
			caste,
			annualIncome,
			state,
			district,
		} = req.body;

		// 2. Check if user already exists (Email or Aadhaar)
		const existingUser = await User.findOne({
			$or: [{ email }, { governmentId }],
		});

		if (existingUser) {
			return res.status(400).json({
				error: "Registration failed: Email or Government ID already in use.",
			});
		}

		// 3. Hash the password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// 4. Create User (Including all eligibility data)
		const user = await User.create({
			name,
			email,
			password: hashedPassword,
			governmentId,
			familyId,
			age,
			gender,
			caste,
			annualIncome,
			state,
			district,
		});

		res.status(201).json({
			success: true,
			message: "User registered successfully",
			token: generateToken(user._id),
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email });
		// We use a generic message so hackers don't know if the email exists or not
		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		res.status(200).json({
			success: true,
			token: generateToken(user._id),
			user: { id: user._id, name: user.name }, // Send basic info back to frontend
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
