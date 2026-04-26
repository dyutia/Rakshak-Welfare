const multer = require("multer");
const { performUniversalAudit } = require("../utils/auditService");
const Scheme = require("../models/Scheme");
const checkEligibility = require("../utils/matcher");

const storage = multer.memoryStorage();
const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadDocument = upload.single("document");

const auditUpload = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({
				success: false,
				error: "Please upload a document image (JPG/PNG).",
			});
		}

		if (req.file.mimetype === "application/pdf") {
			return res.status(400).json({
				success: false,
				error: "PDF scans are not supported yet. Please upload a JPG/PNG photo.",
			});
		}

		const { docType } = req.body;
		if (!docType) {
			return res.status(400).json({
				success: false,
				error: "Please specify the document type.",
			});
		}

		const auditResults = await performUniversalAudit(
			req.file.buffer,
			req.user,
			docType,
		);

		// If audit is valid, add to verifiedDocuments
		if (auditResults.isValid) {
			const user = req.user;
			if (!user.verifiedDocuments.includes(docType)) {
				user.verifiedDocuments.push(docType);
				await user.save({ validateBeforeSave: false });
			}
		}

		// Auto-Promotion: re-run matcher to refresh Eligible/Potential
		const user = req.user;
		const schemes = await Scheme.find({ isActive: true });

		const eligible = [];
		const potential = [];

		for (const scheme of schemes) {
			const result = checkEligibility(user, scheme);
			const schemeData = {
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
							.filter(
								(docName) => typeof docName === "string" && docName.trim(),
							)
					: [],
			};

			if (result.eligible) eligible.push(schemeData);
			else if (result.potential) potential.push(schemeData);
		}

		// Sort potential schemes by eligibility percentage (highest first)
		potential.sort((a, b) => b.eligibilityPercentage - a.eligibilityPercentage);

		return res.json({
			success: true,
			results: auditResults,
			docType,
			schemes: { eligible, potential },
			userDocuments: {
				documentsHeld: user.documentsHeld || [],
				verifiedDocuments: user.verifiedDocuments || [],
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: "AI Audit failed: " + error.message,
		});
	}
};

module.exports = {
	uploadDocument,
	auditUpload,
};
