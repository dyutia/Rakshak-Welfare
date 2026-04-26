const auditorOnly = (req, res, next) => {
	const auditorKey = process.env.AUDITOR_KEY;
	if (!auditorKey) {
		return res
			.status(500)
			.json({ message: "AUDITOR_KEY is not configured on the server." });
	}

	const provided = req.headers["x-auditor-key"];
	if (!provided || provided !== auditorKey) {
		return res.status(403).json({ message: "Forbidden" });
	}

	next();
};

module.exports = { auditorOnly };

