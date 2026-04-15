const mongoose = require("mongoose");

const commonMongoOptions = {
	serverSelectionTimeoutMS: 15000,
	connectTimeoutMS: 15000,
	socketTimeoutMS: 45000,
	family: 4, // Prefer IPv4; hotspots/carriers often break IPv6/DNS paths.
	maxPoolSize: 10,
	retryWrites: true,
};

const isSrvLookupFailure = (message = "") =>
	message.includes("querySrv") ||
	message.includes("ENOTFOUND _mongodb._tcp") ||
	message.includes("ECONNREFUSED _mongodb._tcp");

const connectDB = async () => {
	const primaryUri = process.env.MONGO_URI;
	const directUri = process.env.MONGO_URI_DIRECT;
	let connectionMode = "primary";

	if (!primaryUri) {
		console.error("MongoDB connection failed: MONGO_URI is not set.");
		process.exit(1);
	}

	try {
		await mongoose.connect(primaryUri, commonMongoOptions);
		console.log("MongoDB Connected");
	} catch (error) {
		if (isSrvLookupFailure(error.message) && directUri) {
			console.warn(
				"Primary MongoDB URI failed at SRV lookup. Retrying with MONGO_URI_DIRECT...",
			);
			try {
				await mongoose.connect(directUri, commonMongoOptions);
				connectionMode = "direct-fallback";
			} catch (fallbackError) {
				console.error(
					"MongoDB direct fallback failed:",
					fallbackError.message,
				);
				console.error("MongoDB error name:", fallbackError.name);
				process.exit(1);
			}
		}

		console.error("MongoDB connection failed:", error.message);
		console.error("MongoDB error name:", error.name);

		if (error.message?.includes("ENOTFOUND")) {
			console.error(
				"Hint: DNS issue. On hotspot, set DNS to 8.8.8.8 or 1.1.1.1 and retry.",
			);
		}
		if (error.message?.includes("ECONNREFUSED")) {
			console.error(
				"Hint: Network/carrier is blocking Atlas port or route. Try another hotspot/APN/VPN.",
			);
		}
		if (error.message?.includes("ETIMEDOUT")) {
			console.error(
				"Hint: Connection timed out. This is often hotspot routing/firewall related.",
			);
		}
		if (error.message?.toLowerCase().includes("authentication failed")) {
			console.error(
				"Hint: Verify username/password in MONGO_URI and URL-encode special characters.",
			);
		}

		process.exit(1);
	}

	console.log(`[DB] Connection mode: ${connectionMode}`);
};

module.exports = connectDB;