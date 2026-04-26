const User = require("../models/User");

exports.approvePhoneRecovery = async (req, res) => {
	try {
		const aadhaarNumber = req.body.aadhaarNumber?.toString().trim();
		if (!aadhaarNumber) {
			return res.status(400).json({ error: "aadhaarNumber is required." });
		}

		const user = await User.findOne({ aadhaarNumber });
		if (!user) {
			return res.status(404).json({ error: "User not found." });
		}
		if (user.phoneRecoveryStatus !== "pending" || !user.pendingPhoneNumber) {
			return res
				.status(400)
				.json({ error: "No pending phone recovery request for this user." });
		}

		const newPhone = user.pendingPhoneNumber;
		const phoneInUse = await User.findOne({
			phoneNumber: newPhone,
			_id: { $ne: user._id },
		});
		if (phoneInUse) {
			return res.status(400).json({ error: "Pending phone number is already in use." });
		}

		user.phoneNumber = newPhone;
		user.pendingPhoneNumber = undefined;
		user.phoneRecoveryStatus = "approved";
		await user.save({ validateBeforeSave: false });

		return res.status(200).json({
			success: true,
			message: "Phone number linked successfully.",
			user: { id: user._id, phoneNumber: user.phoneNumber, aadhaarNumber: user.aadhaarNumber },
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.rejectPhoneRecovery = async (req, res) => {
	try {
		const aadhaarNumber = req.body.aadhaarNumber?.toString().trim();
		if (!aadhaarNumber) {
			return res.status(400).json({ error: "aadhaarNumber is required." });
		}

		const user = await User.findOne({ aadhaarNumber });
		if (!user) {
			return res.status(404).json({ error: "User not found." });
		}

		user.pendingPhoneNumber = undefined;
		user.phoneRecoveryStatus = "rejected";
		await user.save({ validateBeforeSave: false });

		return res.status(200).json({
			success: true,
			message: "Recovery request rejected.",
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

