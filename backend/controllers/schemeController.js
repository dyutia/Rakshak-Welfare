const User = require("../models/User");
const Scheme = require("../models/Scheme");
const checkEligibility = require("../utils/matcher");

exports.getEligibleSchemes = async (req, res) => {
	try {
		const userId = req.user.id;

		// Fetch user from database
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Fetch all active schemes
		// Pre-filter by state and gender in the database to save CPU power
		const schemes = await Scheme.find({
			isActive: true,
			$or: [{ state: "Central" }, { state: user.state }],
			$or: [
				{ "eligibility.gender": "All" },
				{ "eligibility.gender": user.gender },
			],
		});
		const eligible = [];
		const potential = [];

		// Check eligibility for each scheme
		for (const scheme of schemes) {
			const result = checkEligibility(user, scheme);

			if (result.eligible) {
				eligible.push({
					schemeId: scheme._id,
					schemeName: scheme.name,
					...result,
				});
			} else if (
				result.missingDocuments &&
				result.missingDocuments.length > 0
			) {
				potential.push({
					schemeId: scheme._id,
					schemeName: scheme.name,
					missingDocuments: result.missingDocuments,
					...result,
				});
			}
		}

		res.json({ eligible, potential });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error fetching schemes", error: error.message });
	}
};
