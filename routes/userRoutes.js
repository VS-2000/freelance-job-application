const express = require("express");
const { getProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// GET: User Profile (Protected)
router.get("/profile", protect, getProfile);

// POST: Logout (Protected)
router.post("/logout", protect, (req, res) => {
  res.status(200).json({
    message: "Logout successful (remove token client-side)"
  });
});

module.exports = router;
