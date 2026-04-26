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
	const eligibilityFactors = [];
	let totalScore = 100;

	// Age eligibility with percentage calculation
	const userAge = Number(user.age);
	if (Number.isFinite(userAge)) {
		let ageScore = 100;
		if (userAge < minAge) {
			const ageDiff = minAge - userAge;
			if (ageDiff <= 2) {
				potential = true;
				ageScore = Math.max(0, 100 - (ageDiff * 25)); // 25% penalty per year
				improvements.push(
					`You are close to the minimum age requirement. You can become eligible once you turn ${minAge}.`,
				);
			} else {
				reasons.push(`Age must be between ${minAge} and ${maxAge}.`);
				eligible = false;
				ageScore = 0;
			}
		} else if (userAge > maxAge) {
			const ageDiff = userAge - maxAge;
			if (ageDiff <= 2) {
				potential = true;
				ageScore = Math.max(0, 100 - (ageDiff * 25)); // 25% penalty per year
				improvements.push(
					`You are slightly above the maximum age limit of ${maxAge}. This scheme may fit you only if the age rule is relaxed or updated.`,
				);
			} else {
				reasons.push(`Age must be between ${minAge} and ${maxAge}.`);
				eligible = false;
				ageScore = 0;
			}
		}
		eligibilityFactors.push({ type: 'age', score: ageScore, weight: 0.25 });
	}

	// Income eligibility with percentage calculation
	const userIncome = Number(user.annualIncome);
	if (Number.isFinite(userIncome) && Number.isFinite(incomeLimit)) {
		let incomeScore = 100;
		if (userIncome > incomeLimit) {
			const allowedNearMiss = incomeLimit * 1.1;
			if (userIncome <= allowedNearMiss) {
				potential = true;
				const excessRatio = (userIncome - incomeLimit) / (allowedNearMiss - incomeLimit);
				incomeScore = Math.max(0, 100 - (excessRatio * 50)); // Up to 50% penalty for near miss
				improvements.push(
					`Your income is slightly above the limit. You may become eligible if your annual income is reduced to Rs ${incomeLimit.toLocaleString("en-IN")} or lower.`,
				);
			} else {
				reasons.push(
					`Annual income must not exceed Rs ${incomeLimit.toLocaleString("en-IN")}.`,
				);
				eligible = false;
				incomeScore = 0;
			}
		}
		eligibilityFactors.push({ type: 'income', score: incomeScore, weight: 0.25 });
	}

	// Gender eligibility (binary - either 0% or 100%)
	let genderScore = 100;
	if (
		scheme.eligibility.gender !== "All" &&
		user.gender !== scheme.eligibility.gender
	) {
		reasons.push(
			`This scheme is specifically for ${scheme.eligibility.gender} applicants.`,
		);
		eligible = false;
		genderScore = 0;
	}
	eligibilityFactors.push({ type: 'gender', score: genderScore, weight: 0.15 });

	// Caste eligibility (binary - either 0% or 100%)
	let casteScore = 100;
	if (!scheme.eligibility.caste.includes(user.caste)) {
		reasons.push(
			`This scheme is not applicable for the ${user.caste} category.`,
		);
		eligible = false;
		casteScore = 0;
	}
	eligibilityFactors.push({ type: 'caste', score: casteScore, weight: 0.15 });

	// State eligibility (binary - either 0% or 100%)
	let stateScore = 100;
	if (scheme.state !== "Central" && user.state !== scheme.state) {
		reasons.push(`This is a state-specific scheme for ${scheme.state}.`);
		eligible = false;
		stateScore = 0;
	}
	eligibilityFactors.push({ type: 'state', score: stateScore, weight: 0.1 });

	// Document eligibility with percentage calculation
	const verifiedDocTypes = new Set(user.verifiedDocuments || []);
	const heldDocTypes = new Set(user.documentsHeld || []);
	const verificationRequired = [];
	const totalRequiredDocs = (scheme.requiredDocuments || []).length;
	let verifiedDocs = 0;

	(scheme.requiredDocuments || []).forEach((doc) => {
		if (verifiedDocTypes.has(doc.docName)) {
			verifiedDocs++;
		} else if (heldDocTypes.has(doc.docName)) {
			verificationRequired.push(doc.docName);
			potential = true;
		} else {
			missingDocuments.push(doc.docName);
			potential = true;
		}
	});

	// Calculate document score
	let documentScore = 100;
	if (totalRequiredDocs > 0) {
		documentScore = (verifiedDocs / totalRequiredDocs) * 100;
		if (verificationRequired.length > 0) {
			improvements.push(`Verification Required for: ${verificationRequired.join(", ")}`);
		}
		if (missingDocuments.length > 0) {
			improvements.push(
				`You still need these documents: ${missingDocuments.join(", ")}.`,
			);
		}
	}
	eligibilityFactors.push({ type: 'documents', score: documentScore, weight: 0.1 });

	// Calculate overall eligibility percentage
	const overallScore = eligibilityFactors.reduce((sum, factor) => {
		return sum + (factor.score * factor.weight);
	}, 0);

	const isEligible = eligible && !potential;
	const isPotential = eligible && potential;

	return {
		eligible: isEligible,
		potential: isPotential,
		eligibilityPercentage: Math.round(overallScore),
		reasons: isPotential ? improvements : reasons,
		disqualificationReasons: reasons,
		improvements,
		missingDocuments,
		verificationRequired,
		eligibilityFactors,
	};
}

module.exports = checkEligibility;
