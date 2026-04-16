const User = require("../models/User");
const Scheme = require("../models/Scheme");
const checkEligibility = require("../utils/matcher");

const buildSchemeResponse = (scheme, result) => ({
	schemeId: scheme._id,
	schemeName: scheme.name,
	description: scheme.description,
	reasons: result.reasons,
	missingDocuments: result.missingDocuments,
});

const getEligibleSchemesForUser = async (user) => {
	const schemes = await Scheme.find({
		isActive: true,
		$and: [
			{ $or: [{ state: "Central" }, { state: user.state }] },
			{
				$or: [
					{ "eligibility.gender": "All" },
					{ "eligibility.gender": user.gender },
				],
			},
		],
	});

	const eligible = [];
	const potential = [];

	for (const scheme of schemes) {
		const result = checkEligibility(user, scheme);
		const schemeData = buildSchemeResponse(scheme, result);

		if (result.eligible) {
			eligible.push(schemeData);
		} else if (result.potential) {
			potential.push(schemeData);
		}
	}

	return { eligible, potential };
};

exports.updateProfile = async (req, res) => {
	try {
		const allowedFields = [
			"name",
			"age",
			"gender",
			"caste",
			"annualIncome",
			"state",
			"district",
			"familyId",
			"documentsHeld",
		];

		const updates = {};
		for (const key of allowedFields) {
			if (req.body[key] !== undefined) {
				updates[key] = req.body[key];
			}
		}

		if (updates.documentsHeld !== undefined) {
			if (!Array.isArray(updates.documentsHeld)) {
				return res
					.status(400)
					.json({ message: "documentsHeld must be an array of strings" });
			}
			updates.documentsHeld = updates.documentsHeld
				.filter((doc) => typeof doc === "string")
				.map((doc) => doc.trim())
				.filter(Boolean);
		}

		const user = await User.findByIdAndUpdate(req.user.id, updates, {
			new: true,
			runValidators: true,
		});

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const schemes = await getEligibleSchemesForUser(user);

		res.json({
			success: true,
			user,
			schemes,
		});
	} catch (error) {
		res.status(500).json({ message: "Profile update failed", error: error.message });
	}
};
