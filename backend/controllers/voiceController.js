const multer = require("multer");
const User = require("../models/User");
const { getInstructionalAudio, detectUserLanguage, getLanguageName } = require("../utils/bhashiniService");

const storage = multer.memoryStorage();
const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const getInstructionalAudio = async (req, res) => {
	try {
		const { lang = 'hi' } = req.query;
		const instructionalText = lang === 'hi' 
			? "नमस्ते, अपनी मातृभाषा में कुछ शब्द बोलें। हम आपकी भाषा पहचानेंगे।"
			: "नमस्कार, आपल्या मूळ भाषेत काहीतरी बोला। आम्ही तुमची भाषा ओळखून घेऊ।";

		const audioBase64 = await getInstructionalAudio(instructionalText, lang);
		
		res.json({
			success: true,
			audioBase64,
			text: instructionalText,
			lang
		});
	} catch (error) {
		console.error("Instructional audio error:", error);
		res.status(500).json({
			success: false,
			error: "Failed to generate instructional audio"
		});
	}
};

const getFollowupAudio = async (req, res) => {
	try {
		const followupText = "कृपया कुछ बोलिए।"; // "Please say something" in Hindi
		const audioBase64 = await getInstructionalAudio(followupText, 'hi');
		
		res.json({
			success: true,
			audioBase64,
			text: followupText,
			lang: 'hi'
		});
	} catch (error) {
		console.error("Followup audio error:", error);
		res.status(500).json({
			success: false,
			error: "Failed to generate follow-up audio"
		});
	}
};

const detectLanguage = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({
				success: false,
				error: "Please upload an audio file"
			});
		}

		const audioBuffer = req.file.buffer;
		const detectionResult = await detectUserLanguage(audioBuffer);

		if (detectionResult.error) {
			throw new Error(detectionResult.error);
		}

		// Get language name in native script
		const languageName = getLanguageName(detectionResult.language);

		const result = {
			language: detectionResult.language,
			languageName,
			confidence: detectionResult.confidence,
			transcript: detectionResult.transcript
		};

		res.json({
			success: true,
			result
		});
	} catch (error) {
		console.error("Language detection error:", error);
		res.status(500).json({
			success: false,
			error: "Failed to detect language"
		});
	}
};

const updateLanguagePreference = async (req, res) => {
	try {
		const userId = req.user.id;
		const { language, languageName } = req.body;

		if (!language) {
			return res.status(400).json({
				success: false,
				error: "Language code is required"
			});
		}

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				error: "User not found"
			});
		}

		// Update user's language preference
		user.preferredLanguage = language;
		user.languageDetected = true;
		await user.save();

		res.json({
			success: true,
			message: `Language preference updated to ${languageName || language}`,
			preferredLanguage: language,
			languageName
		});
	} catch (error) {
		console.error("Update language preference error:", error);
		res.status(500).json({
			success: false,
			error: "Failed to update language preference"
		});
	}
};

const getLanguagePreference = async (req, res) => {
	try {
		const userId = req.user.id;
		const user = await User.findById(userId).select('preferredLanguage languageDetected');
		
		if (!user) {
			return res.status(404).json({
				success: false,
				error: "User not found"
			});
		}

		res.json({
			success: true,
			preferredLanguage: user.preferredLanguage,
			languageDetected: user.languageDetected
		});
	} catch (error) {
		console.error("Get language preference error:", error);
		res.status(500).json({
			success: false,
			error: "Failed to get language preference"
		});
	}
};

module.exports = {
	getInstructionalAudio,
	getFollowupAudio,
	detectLanguage: [upload.single('audio'), detectLanguage],
	updateLanguagePreference,
	getLanguagePreference
};
