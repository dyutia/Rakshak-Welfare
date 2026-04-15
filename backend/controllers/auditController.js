const multer = require("multer");
const { performDocumentAudit } = require("../utils/auditService");

const storage = multer.memoryStorage();
const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadDocument = upload.single("document");

const auditUpload = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({
				success: false,
				error: "Please upload a document image (JPG/PNG).",
			});
		}

		const auditResults = await performDocumentAudit(req.file.buffer, req.user);

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
};

module.exports = {
	uploadDocument,
	auditUpload,
};
