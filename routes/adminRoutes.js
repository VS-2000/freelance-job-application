const express = require("express");
const {
    verifyFreelancer,
    getPlatformStats,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.put("/verify/:id", protect, adminOnly, verifyFreelancer);
router.get("/stats", protect, adminOnly, getPlatformStats);

module.exports = router;
