const express = require("express");
const {
	register,
	login,
	verifyOtp,
	recoveryUpload,
	requestPhoneRecovery,
	logout,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/recover-phone", recoveryUpload, requestPhoneRecovery);
router.post("/logout", logout);

module.exports = router;
