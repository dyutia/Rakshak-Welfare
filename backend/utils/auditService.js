const Tesseract = require("tesseract.js");
const Fuse = require("fuse.js");

async function performDocumentAudit(imageBuffer, user) {
	const warnings = [];
	let confidenceScore = 1;
	let isValid = true;

	try {
		// 1. Extract text from image
		const {
			data: { text },
		} = await Tesseract.recognize(imageBuffer, "eng");

		// Clean the text: remove extra spaces and newlines for better matching
		const cleanText = text.replace(/\s+/g, " ");

		// 2. Fuzzy Name Search (Search across the WHOLE text)
		const fuse = new Fuse([cleanText], {
			includeScore: true,
			threshold: 0.4, // Higher threshold allows for more OCR errors
		});

		const nameMatch = fuse.search(user.name);

		// If name is NOT found anywhere in the document
		if (nameMatch.length === 0) {
			warnings.push("User name not detected in document");
			isValid = false;
			confidenceScore *= 0.5;
		}

		// 3. Smart Date Checking
		const dateRegex = /(\d{2})\/(\d{2})\/(\d{4})/g;
		const matches = [...text.matchAll(dateRegex)];

		const today = new Date();
		const oneYearAgo = new Date();
		oneYearAgo.setFullYear(today.getFullYear() - 1);

		matches.forEach((match) => {
			const dateString = match[0];
			const [day, month, year] = dateString.split("/");
			const detectedDate = new Date(`${year}-${month}-${day}`);

			// LOGIC: If the year is very old (e.g., 1990), it's likely a DOB, not an expiry date.
			// We only flag dates that are recent but older than 1 year (like an old Income Cert).
			const ageOfDoc = today.getFullYear() - detectedDate.getFullYear();

			if (ageOfDoc > 1 && ageOfDoc < 5) {
				warnings.push(`Potential expired document date found: ${dateString}`);
				// We don't mark isValid = false immediately, just warn the user
				confidenceScore *= 0.8;
			}
		});

		return {
			isValid,
			confidenceScore: Math.round(confidenceScore * 100) / 100,
			warnings,
			extractedSnippet: cleanText.substring(0, 100) + "...", // For debugging
		};
	} catch (error) {
		return {
			isValid: false,
			confidenceScore: 0,
			warnings: [`AI Audit Error: ${error.message}`],
		};
	}
}

module.exports = { performDocumentAudit };
