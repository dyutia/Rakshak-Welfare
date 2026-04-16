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
		const { docType } = req.body;
		if (!docType) {
			return res.status(400).json({
				success: false,
				error: "Please specify the document type.",
			});
		}

		const auditResults = await performDocumentAudit(req.file.buffer, req.user);

		// If audit is valid, add to verifiedDocuments
		if (auditResults.isValid) {
			const user = req.user;
			if (!user.verifiedDocuments.includes(docType)) {
				user.verifiedDocuments.push(docType);
				await user.save();
			}
		}

		res.json({
			success: true,
			results: auditResults,
			docType,
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
