function checkEligibility(user, scheme) {
	const reasons = [];
	const missingDocuments = [];
	let eligible = true;

	const minAge = scheme.eligibility?.age?.min || 0;
	const maxAge = scheme.eligibility?.age?.max || 120;
	if (user.age < minAge || user.age > maxAge) {
		reasons.push(`Age must be between ${minAge} and ${maxAge}`);
		eligible = false;
	}

	if (user.annualIncome > scheme.eligibility.incomeLimit) {
		reasons.push(
			`Annual income must not exceed Rs ${scheme.eligibility.incomeLimit}`,
		);
		eligible = false;
	}

	if (
		scheme.eligibility.gender !== "All" &&
		user.gender !== scheme.eligibility.gender
	) {
		reasons.push(
			`This scheme is specifically for ${scheme.eligibility.gender} applicants`,
		);
		eligible = false;
	}

	if (!scheme.eligibility.caste.includes(user.caste)) {
		reasons.push(
			`Selected scheme is not applicable for ${user.caste} category`,
		);
		eligible = false;
	}

	if (scheme.state !== "Central" && user.state !== scheme.state) {
		reasons.push(`This is a state-specific scheme for ${scheme.state}`);
		eligible = false;
	}

	const uploadedDocTypes = (user.uploadedDocuments || []).map(
		(doc) => doc.docType,
	);

	(scheme.requiredDocuments || []).forEach((doc) => {
		if (!uploadedDocTypes.includes(doc.docName)) {
			missingDocuments.push(doc.docName);
		}
	});

	return {
		eligible,
		reasons,
		missingDocuments,
	};
}

module.exports = checkEligibility;
