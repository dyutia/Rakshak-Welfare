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

module.exports = { translateText };
