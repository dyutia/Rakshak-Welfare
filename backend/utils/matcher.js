function checkEligibility(user, scheme) {
	const reasons = [];
	const missingDocs = [];
	let eligible = true;

	// 1. Check age eligibility (with safety defaults)
	const minAge = scheme.eligibility?.age?.min || 0;
	const maxAge = scheme.eligibility?.age?.max || 120;
	if (user.age < minAge || user.age > maxAge) {
		reasons.push(`Age must be between ${minAge} and ${maxAge}`);
		eligible = false;
	}

	// 2. Check annual income
	if (user.annualIncome > scheme.eligibility.incomeLimit) {
		reasons.push(
			`Annual income must not exceed ₹${scheme.eligibility.incomeLimit}`,
		);
		eligible = false;
	}

	// 3. Check gender eligibility
	if (
		scheme.eligibility.gender !== "All" &&
		user.gender !== scheme.eligibility.gender
	) {
		reasons.push(
			`This scheme is specifically for ${scheme.eligibility.gender} applicants`,
		);
		eligible = false;
	}

	// 4. Check caste eligibility
	if (!scheme.eligibility.caste.includes(user.caste)) {
		reasons.push(
			`Selected scheme is not applicable for ${user.caste} category`,
		);
		eligible = false;
	}

	// 5. Check state eligibility
	if (scheme.state !== "Central" && user.state !== scheme.state) {
		reasons.push(`This is a state-specific scheme for ${scheme.state}`);
		eligible = false;
	}

	// 6. Check missing documents (FIXED FIELD NAMES)
	// We map 'docType' from the User model
	const uploadedDocTypes = user.uploadedDocuments.map((doc) => doc.docType);

	// We check against 'docName' from the Scheme model
	scheme.requiredDocuments.forEach((doc) => {
		if (!uploadedDocTypes.includes(doc.docName)) {
			missingDocs.push(doc.docName);
			// We don't set eligible = false here because they qualify,
			// they just need to upload the file.
		}
	});

	return {
		eligible,
		reasons,
		missingDocs,
	};
}

module.exports = checkEligibility;
