function checkEligibility(user, scheme) {
	const minAge = scheme.eligibility?.age?.min || 0;
	const maxAge = scheme.eligibility?.age?.max || 120;
	const incomeLimit =
		scheme.eligibility?.incomeLimit ?? Number.POSITIVE_INFINITY;
	const reasons = [];
	const missingDocuments = [];
	const improvements = [];
	let eligible = true;
	let potential = false;

	const userAge = Number(user.age);
	if (Number.isFinite(userAge)) {
		if (userAge < minAge) {
			if (minAge - userAge <= 2) {
				potential = true;
				improvements.push(
					`You are close to the minimum age requirement. You can become eligible once you turn ${minAge}.`,
				);
			} else {
				reasons.push(`Age must be between ${minAge} and ${maxAge}.`);
				eligible = false;
			}
		} else if (userAge > maxAge) {
			if (userAge - maxAge <= 2) {
				potential = true;
				improvements.push(
					`You are slightly above the maximum age limit of ${maxAge}. This scheme may fit you only if the age rule is relaxed or updated.`,
				);
			} else {
				reasons.push(`Age must be between ${minAge} and ${maxAge}.`);
				eligible = false;
			}
		}
	}

	const userIncome = Number(user.annualIncome);
	if (Number.isFinite(userIncome) && Number.isFinite(incomeLimit)) {
		if (userIncome > incomeLimit) {
			const allowedNearMiss = incomeLimit * 1.1;
			if (userIncome <= allowedNearMiss) {
				potential = true;
				improvements.push(
					`Your income is slightly above the limit. You may become eligible if your annual income is reduced to Rs ${incomeLimit.toLocaleString("en-IN")} or lower.`,
				);
			} else {
				reasons.push(
					`Annual income must not exceed Rs ${incomeLimit.toLocaleString("en-IN")}.`,
				);
				eligible = false;
			}
		}
	}

	if (
		scheme.eligibility.gender !== "All" &&
		user.gender !== scheme.eligibility.gender
	) {
		reasons.push(
			`This scheme is specifically for ${scheme.eligibility.gender} applicants.`,
		);
		eligible = false;
	}

	if (!scheme.eligibility.caste.includes(user.caste)) {
		reasons.push(
			`This scheme is not applicable for the ${user.caste} category.`,
		);
		eligible = false;
	}

	if (scheme.state !== "Central" && user.state !== scheme.state) {
		reasons.push(`This is a state-specific scheme for ${scheme.state}.`);
		eligible = false;
	}

	const verifiedDocTypes = new Set(user.verifiedDocuments || []);
	const heldDocTypes = new Set(user.documentsHeld || []);
	const verificationRequired = [];

	(scheme.requiredDocuments || []).forEach((doc) => {
		if (!verifiedDocTypes.has(doc.docName)) {
			if (heldDocTypes.has(doc.docName)) {
				verificationRequired.push(doc.docName);
			} else {
				missingDocuments.push(doc.docName);
			}
		}
	});

	if (verificationRequired.length > 0) {
		potential = true;
		improvements.push("Verification Required");
	}

	if (missingDocuments.length > 0) {
		potential = true;
		improvements.push(
			`You still need these documents: ${missingDocuments.join(", ")}.`,
		);
	}

	const isEligible = eligible && !potential;
	const isPotential = eligible && potential;

	return {
		eligible: isEligible,
		potential: isPotential,
		reasons: isPotential ? improvements : reasons,
		disqualificationReasons: reasons,
		improvements,
		missingDocuments,
	};
}

module.exports = checkEligibility;
