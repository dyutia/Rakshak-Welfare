const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { updateProfile } = require("../controllers/userController");

const router = express.Router();

// Update logged-in user's profile and return updated eligibility
router.patch("/me", protect, updateProfile);

module.exports = router;
