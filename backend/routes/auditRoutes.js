const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const { performDocumentAudit } = require("../utils/auditService");

const router = express.Router();

// Memory storage setup
const storage = multer.memoryStorage();
const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
});

// The Final Protected Route
router.post(
	"/audit-upload",
	protect, // Ensure user is logged in
	upload.single("document"), // Handle the file upload
	async (req, res) => {
		try {
			// 1. Check if file exists
			if (!req.file) {
				return res.status(400).json({
					success: false,
					error: "Please upload a document image (JPG/PNG).",
				});
			}

			// 2. Run the AI Audit using the real req.user from middleware
			const auditResults = await performDocumentAudit(
				req.file.buffer,
				req.user,
			);

			// 3. Send back the results
			res.json({
				success: true,
				results: auditResults,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				error: "AI Audit failed: " + error.message,
			});
		}
	},
);

module.exports = router;
