const express = require("express");
const {
    submitContactMessage,
    getAllContacts,
    respondToContact,
    getUserContactMessages
} = require("../controllers/contactController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", submitContactMessage);
router.get("/my-messages", getUserContactMessages);
router.get("/admin", protect, adminOnly, getAllContacts);
router.put("/:id/respond", protect, adminOnly, respondToContact);

module.exports = router;
