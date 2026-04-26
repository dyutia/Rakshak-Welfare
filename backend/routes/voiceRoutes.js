const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
	getInstructionalAudio,
	getFollowupAudio,
	detectLanguage,
	updateLanguagePreference,
	getLanguagePreference
} = require("../controllers/voiceController");

// Get instructional audio (Hindi greeting)
router.get("/instructional-audio", authMiddleware, getInstructionalAudio);

// Get follow-up audio for no speech detected
router.get("/followup-audio", authMiddleware, getFollowupAudio);

// Detect language from uploaded audio
router.post("/detect-language", authMiddleware, detectLanguage);

// Update user's language preference
router.post("/update-preference", authMiddleware, updateLanguagePreference);

// Get user's language preference
router.get("/preference", authMiddleware, getLanguagePreference);

module.exports = router;
