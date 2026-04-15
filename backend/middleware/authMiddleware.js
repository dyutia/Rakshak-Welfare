const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization || "";
		const bearerToken = authHeader.startsWith("Bearer ")
			? authHeader.slice(7)
			: null;
		// Prefer cookie token, but accept bearer token for API clients.
		const token = req.cookies.token || bearerToken;

		if (!token) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.id).select("-password");

		if (!user) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		req.user = user;
		next();
	} catch (error) {
		res.status(401).json({ message: "Unauthorized" });
	}
};

module.exports = { protect };
