const axios = require("axios");

const translateText = async (text, targetLanguage) => {
	try {
		// Note: In a real scenario, you'd get these credentials from Bhashini's portal
		const config = {
			method: "post",
			url: "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline",
			headers: {
				"Content-Type": "application/json",
				apiKey: process.env.BHASHINI_API_KEY,
			},
			data: {
				pipelineTasks: [
					{
						taskType: "translation",
						config: {
							language: {
								sourceLanguage: "en",
								targetLanguage: targetLanguage, // e.g., 'hi' for Hindi, 'mr' for Marathi
							},
						},
					},
				],
				inputData: { input: [{ source: text }] },
			},
		};

		const response = await axios(config);
		// Returning the translated string
		return response.data.pipelineResponse[0].output[0].target;
	} catch (error) {
		console.error("Bhashini Translation Error:", error.message);
		return text; // Fallback to English if translation fails
	}
};

const getInstructionalAudio = async (text, lang = 'hi') => {
	try {
		// Bhashini TTS API configuration
		const config = {
			method: "post",
			url: "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline",
			headers: {
				"Content-Type": "application/json",
				apiKey: process.env.BHASHINI_API_KEY,
			},
			data: {
				pipelineTasks: [
					{
						taskType: "tts",
						config: {
							language: {
								sourceLanguage: lang,
							},
						},
					},
				],
				inputData: { input: [{ source: text }] },
			},
		};

		const response = await axios(config);
		// Return the Base64 audio string
		return response.data.pipelineResponse[0].output[0].audio;
	} catch (error) {
		console.error("Bhashini TTS Error:", error.message);
		throw new Error("Failed to generate instructional audio");
	}
};

const detectUserLanguage = async (audioBuffer) => {
	try {
		// Bhashini Language Identification API configuration
		const config = {
			method: "post",
			url: "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline",
			headers: {
				"Content-Type": "application/json",
				apiKey: process.env.BHASHINI_API_KEY,
			},
			data: {
				pipelineTasks: [
					{
						taskType: "asr", // Automatic Speech Recognition with LID
						config: {
							language: {
								sourceLanguage: "auto", // Auto-detect language
							},
							"audioFormat": "wav",
						},
					},
				],
				inputData: { 
					input: [{ 
						audio: audioBuffer.toString('base64'),
						audioFormat: "wav"
					}] 
				},
			},
		};

		const response = await axios(config);
		const result = response.data.pipelineResponse[0].output[0];
		
		// Extract detected language code (e.g., 'hi', 'mr', 'bn', 'en')
		const detectedLanguage = result.sourceLanguage || 'en';
		const confidence = result.confidence || 0;
		
		return {
			language: detectedLanguage,
			confidence: confidence,
			transcript: result.target || ''
		};
	} catch (error) {
		console.error("Bhashini Language Detection Error:", error.message);
		return {
			language: 'en',
			confidence: 0,
			transcript: '',
			error: error.message
		};
	}
};

const getLanguageName = (langCode) => {
	const languageMap = {
		'hi': 'हिन्दी',
		'mr': 'मराठी',
		'bn': 'বাংলা',
		'en': 'English',
		'ta': 'தமிழ்',
		'te': 'తెలుగు',
		'gu': 'ગુજરાતી',
		'kn': 'ಕನ್ನಡ',
		'ml': 'മലയാളം',
		'pa': 'ਪੰਜਾਬੀ'
	};
	return languageMap[langCode] || langCode;
};

module.exports = { 
	translateText, 
	getInstructionalAudio, 
	detectUserLanguage,
	getLanguageName
};
