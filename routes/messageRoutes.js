const express = require("express");
const {
    sendMessage,
    getMessages,
    getInbox,
    sendDirectMessage,
    getDirectMessages,
    getAdminInbox
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/inbox", protect, getInbox);
router.get("/:jobId/:otherUserId", protect, getMessages);

// Direct messaging routes (no job required)
router.post("/direct", protect, sendDirectMessage);
router.get("/direct/:otherUserId", protect, getDirectMessages);
router.get("/admin/inbox", protect, getAdminInbox);

module.exports = router;
