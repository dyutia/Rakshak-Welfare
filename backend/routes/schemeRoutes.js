const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getEligibleSchemes } = require("../controllers/schemeController");
const Scheme = require("../models/Scheme"); // 1. Added missing import
const { translateText } = require("../utils/bhashiniService"); // 2. Added translation utility

const router = express.Router();

// Get eligible schemes for the logged-in user
router.get("/eligible", protect, getEligibleSchemes);

// Updated Voice Route with Translation support
router.get("/voice-info/:schemeName", async (req, res) => {
	try {
		const { lang = "en" } = req.query; // Get ?lang=hi from URL

		const scheme = await Scheme.findOne({
			name: { $regex: new RegExp(req.params.schemeName, "i") },
		});

		if (!scheme) {
			return res.status(404).json({ message: "Scheme not found" });
		}

		// Prepare English text
		const rawText = `${scheme.name} is handled by the ${scheme.department}. To be eligible, you should have an annual income below ${scheme.eligibility.annualIncomeLimit} rupees.`;

		// 3. Translate if the requested language isn't English
		const speechText =
			lang === "en" ? rawText : await translateText(rawText, lang);

		res.json({
			speechText,
			link: scheme.applicationLink,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Admin-only Trigger for WhatsApp Notifications
router.post("/notify-new-scheme", protect, async (req, res) => {
	try {
		// In a real app, you'd check: if (req.user.role !== 'admin') ...

		// This is where we will call the Twilio/WhatsApp logic next
		res.json({
			message:
				"Proactive alert system initialized. Scanning for eligible users...",
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
