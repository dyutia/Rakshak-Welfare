const User = require("../models/User");
const Scheme = require("../models/Scheme");
const checkEligibility = require("../utils/matcher");
const { translateText } = require("../utils/bhashiniService");

const buildSchemeResponse = (scheme, result) => ({
	schemeId: scheme._id,
	schemeName: scheme.name,
	description: scheme.description,
	reasons: result.reasons,
	missingDocuments: result.missingDocuments,
	verificationRequired: result.verificationRequired || [],
	eligibilityPercentage: result.eligibilityPercentage || 0,
	eligibilityFactors: result.eligibilityFactors || [],
	requiredDocuments: Array.isArray(scheme.requiredDocuments)
		? scheme.requiredDocuments
				.map((doc) => doc?.docName)
				.filter((docName) => typeof docName === "string" && docName.trim())
		: [],
});

exports.getEligibleSchemes = async (req, res) => {
	try {
		const userId = req.user.id;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Use $and so both state and gender filters apply
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

		// Sort potential schemes by eligibility percentage (highest first)
		potential.sort((a, b) => b.eligibilityPercentage - a.eligibilityPercentage);

		res.json({
			eligible,
			potential,
			userDocuments: {
				documentsHeld: user.documentsHeld || [],
				verifiedDocuments: user.verifiedDocuments || [],
			},
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error fetching schemes", error: error.message });
	}
};

exports.getSchemeVoiceInfo = async (req, res) => {
	try {
		const { lang = "en" } = req.query;

		const scheme = await Scheme.findOne({
			name: { $regex: new RegExp(req.params.schemeName, "i") },
		});

		if (!scheme) {
			return res.status(404).json({ message: "Scheme not found" });
		}

		const rawText = `${scheme.name} is handled by the ${scheme.department}. To be eligible, you should have an annual income below ${scheme.eligibility.incomeLimit} rupees.`;
		const speechText =
			lang === "en" ? rawText : await translateText(rawText, lang);

		res.json({
			speechText,
			link: scheme.applicationLink,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.notifyNewScheme = async (req, res) => {
	try {
		// In a real app, you'd check role-based access here.
		res.json({
			message:
				"Proactive alert system initialized. Scanning for eligible users...",
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
