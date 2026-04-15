const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { uploadDocument, auditUpload } = require("../controllers/auditController");

const router = express.Router();

router.post("/audit-upload", protect, uploadDocument, auditUpload);

module.exports = router;
