const Tesseract = require("tesseract.js");
const Fuse = require("fuse.js");

function extractDigits(text) {
	return (text || "").replace(/\D/g, "");
}

function aadhaarLooksLikeMatch(ocrText, expectedAadhaar) {
	const expectedDigits = extractDigits(expectedAadhaar);
	if (!expectedDigits) return false;

	const ocrDigits = extractDigits(ocrText);
	// Aadhaar is commonly printed with spaces; digits-only search is robust to OCR whitespace.
	return ocrDigits.includes(expectedDigits);
}

function normalizeText(text) {
	return (text || "").toString();
}

function fuzzyNameMatch(ocrText, expectedName) {
	const cleanText = normalizeText(ocrText).replace(/\s+/g, " ").trim();
	const name = (expectedName || "").toString().trim();
	if (!cleanText || !name) return false;

	const fuse = new Fuse([cleanText], {
		includeScore: true,
		threshold: 0.4,
	});

	return fuse.search(name).length > 0;
}

function findDates(text) {
	const raw = normalizeText(text);
	const results = [];

	// dd/mm/yyyy or dd-mm-yyyy
	const dmy = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g;
	for (const match of raw.matchAll(dmy)) {
		const day = Number(match[1]);
		const month = Number(match[2]);
		const year = Number(match[3]);
		if (!day || !month || !year) continue;
		const date = new Date(Date.UTC(year, month - 1, day));
		if (!Number.isNaN(date.getTime())) results.push(date);
	}

	// yyyy-mm-dd
	const ymd = /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g;
	for (const match of raw.matchAll(ymd)) {
		const year = Number(match[1]);
		const month = Number(match[2]);
		const day = Number(match[3]);
		if (!day || !month || !year) continue;
		const date = new Date(Date.UTC(year, month - 1, day));
		if (!Number.isNaN(date.getTime())) results.push(date);
	}

	return results;
}

function extractIncomeAmount(text) {
	const raw = normalizeText(text);
	// Prefer amounts following INR/Rs/₹ keywords, but fall back to any large number.
	const candidates = [];

	const keywordAmount =
		/(?:INR|Rs\.?|₹)\s*([0-9]{1,3}(?:,[0-9]{2,3})+|[0-9]{4,})/gi;
	for (const match of raw.matchAll(keywordAmount)) {
		const num = Number(match[1].replace(/,/g, ""));
		if (Number.isFinite(num)) candidates.push(num);
	}

	// Fallback: any 5+ digit number (annual income usually large enough)
	const bigNumber = /\b([0-9]{5,})\b/g;
	for (const match of raw.matchAll(bigNumber)) {
		const num = Number(match[1].replace(/,/g, ""));
		if (Number.isFinite(num)) candidates.push(num);
	}

	if (!candidates.length) return null;
	// Pick the largest to avoid grabbing pin codes etc.
	return Math.max(...candidates);
}

function looksLikeMatchInsensitive(haystack, needle) {
	if (!haystack || !needle) return false;
	const h = normalizeText(haystack).toLowerCase().replace(/\s+/g, "");
	const n = normalizeText(needle).toLowerCase().replace(/\s+/g, "");
	return h.includes(n);
}

async function performUniversalAudit(imageBuffer, user, docType) {
	const warnings = [];
	let confidenceScore = 1;
	let isValid = true;
	const verificationChecks = [];

	const userName = user?.fullName || user?.name;
	const userAadhaar = user?.aadhaarNumber;
	const userFamilyId = user?.familyId;

	try {
		const {
			data: { text },
		} = await Tesseract.recognize(imageBuffer, "eng");

		const cleanText = normalizeText(text).replace(/\s+/g, " ").trim();

		// Identity Lock: always check name first
		const nameMatched = fuzzyNameMatch(cleanText, userName);
		verificationChecks.push({
			type: 'name',
			passed: nameMatched,
			description: nameMatched ? 'User name detected' : 'User name not detected in document',
			weight: 0.3
		});
		
		if (!nameMatched) {
			warnings.push("User name not detected in document");
			isValid = false;
			confidenceScore *= 0.7;
		}

		const normalizedDocType = (docType || "").toString().trim();
		const extracted = {
			nameMatched,
		};

		// Modular Verification Rules
		if (/aadhaar/i.test(normalizedDocType)) {
			const aadhaarMatched = aadhaarLooksLikeMatch(text, userAadhaar);
			extracted.aadhaarMatched = aadhaarMatched;
			verificationChecks.push({
				type: 'aadhaar',
				passed: aadhaarMatched,
				description: aadhaarMatched ? '12-digit Aadhaar number matches' : 'Aadhaar number not detected or does not match user',
				weight: 0.7
			});
			
			if (!aadhaarMatched) {
				warnings.push("Aadhaar number not detected or does not match user");
				isValid = false;
				confidenceScore *= 0.5;
			}
		} else if (/income/i.test(normalizedDocType)) {
			const amount = extractIncomeAmount(text);
			extracted.annualIncomeDetected = amount;
			
			const amountDetected = Number.isFinite(amount);
			verificationChecks.push({
				type: 'income_amount',
				passed: amountDetected,
				description: amountDetected ? `Annual income amount detected: Rs ${amount?.toLocaleString('en-IN')}` : 'Annual income amount not detected',
				weight: 0.5
			});
			
			if (!amountDetected) {
				warnings.push("Annual income amount not detected");
				isValid = false;
				confidenceScore *= 0.5;
			}

			const dates = findDates(text);
			const latest = dates.length
				? new Date(Math.max(...dates.map((d) => d.getTime())))
				: null;
			extracted.latestDateDetected = latest ? latest.toISOString() : null;

			const oneYearMs = 365 * 24 * 60 * 60 * 1000;
			const dateValid = latest && (Date.now() - latest.getTime() <= oneYearMs);
			
			verificationChecks.push({
				type: 'income_date',
				passed: dateValid,
				description: dateValid ? 'Issue date is within last 1 year' : latest ? 'Income certificate appears older than 1 year' : 'Issue date not detected',
				weight: 0.5
			});

			if (!latest) {
				warnings.push("Issue date not detected");
				isValid = false;
				confidenceScore *= 0.7;
			} else if (!dateValid) {
				warnings.push("Income certificate appears older than 1 year");
				isValid = false;
				confidenceScore *= 0.7;
			}
		} else if (/ration/i.test(normalizedDocType)) {
			const familyMatched = looksLikeMatchInsensitive(text, userFamilyId);
			extracted.familyIdMatched = familyMatched;
			verificationChecks.push({
				type: 'family_id',
				passed: familyMatched,
				description: familyMatched ? 'Family ID matches user record' : 'Family ID not detected or does not match user',
				weight: 0.7
			});
			
			if (!familyMatched) {
				warnings.push("Family ID not detected or does not match user");
				isValid = false;
				confidenceScore *= 0.5;
			}
		} else {
			// Keyword-Based Verification (Marriage/Caste/Student)
			const lower = normalizeText(text).toLowerCase();
			const keywords = [];

			if (/marriage/i.test(normalizedDocType)) {
				keywords.push("marriage");
			}
			if (/caste/i.test(normalizedDocType)) {
				keywords.push("caste", "obc", "sc", "st");
			}
			if (/student/i.test(normalizedDocType)) {
				keywords.push("student", "university", "college", "school");
			}

			const found = keywords.filter((k) => lower.includes(k));
			extracted.keywordsFound = found;
			
			const keywordsDetected = keywords.length === 0 || found.length > 0;
			verificationChecks.push({
				type: 'keywords',
				passed: keywordsDetected,
				description: keywordsDetected ? `Relevant keywords found: ${found.join(', ')}` : 'Expected keywords not detected for this document type',
				weight: 0.7
			});

			if (keywords.length && found.length === 0) {
				warnings.push("Expected keywords not detected for this document type");
				isValid = false;
				confidenceScore *= 0.7;
			}
		}

		// Calculate detailed confidence score based on verification checks
		const totalWeight = verificationChecks.reduce((sum, check) => sum + check.weight, 0);
		const passedWeight = verificationChecks.filter(check => check.passed).reduce((sum, check) => sum + check.weight, 0);
		const calculatedConfidence = totalWeight > 0 ? passedWeight / totalWeight : 0;

		return {
			isValid,
			confidenceScore: Math.round(calculatedConfidence * 100) / 100,
			warnings,
			extractedSnippet: cleanText.substring(0, 120) + "...",
			extracted,
			verificationChecks,
		};
	} catch (error) {
		return {
			isValid: false,
			confidenceScore: 0,
			warnings: [`AI Audit Error: ${error.message}`],
			verificationChecks: [],
		};
	}
}

async function performDocumentAudit(imageBuffer, user, options = {}) {
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

		// 3. Aadhaar check (optional)
		const expectedAadhaar = options.aadhaarNumber;
		let aadhaarMatched = undefined;
		if (expectedAadhaar) {
			aadhaarMatched = aadhaarLooksLikeMatch(text, expectedAadhaar);
			if (!aadhaarMatched) {
				warnings.push("Aadhaar number not detected in document");
				isValid = false;
				confidenceScore *= 0.5;
			}
		}

		// 4. Smart Date Checking
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
			aadhaarMatched,
		};
	} catch (error) {
		return {
			isValid: false,
			confidenceScore: 0,
			warnings: [`AI Audit Error: ${error.message}`],
		};
	}
}

module.exports = { performDocumentAudit, performUniversalAudit };
