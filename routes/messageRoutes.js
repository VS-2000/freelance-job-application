const express = require("express");
const { sendMessage, getMessages, getInbox } = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/inbox", protect, getInbox);
router.get("/:jobId/:otherUserId", protect, getMessages);

module.exports = router;
