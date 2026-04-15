const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
	getEligibleSchemes,
	getSchemeVoiceInfo,
	notifyNewScheme,
} = require("../controllers/schemeController");

const router = express.Router();

// Get eligible schemes for the logged-in user
router.get("/eligible", protect, getEligibleSchemes);

// Get voice-friendly scheme info with optional translation
router.get("/voice-info/:schemeName", getSchemeVoiceInfo);

// Admin-only trigger (placeholder)
router.post("/notify-new-scheme", protect, notifyNewScheme);

module.exports = router;
