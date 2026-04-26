const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { auditorOnly } = require("../middleware/auditorMiddleware");
const { uploadDocument, auditUpload } = require("../controllers/auditController");
const {
	approvePhoneRecovery,
	rejectPhoneRecovery,
} = require("../controllers/auditorController");

const router = express.Router();

router.post("/audit-upload", protect, uploadDocument, auditUpload);
router.post("/approve-phone-recovery", auditorOnly, approvePhoneRecovery);
router.post("/reject-phone-recovery", auditorOnly, rejectPhoneRecovery);

module.exports = router;
