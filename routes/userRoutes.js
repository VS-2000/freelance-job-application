const express = require("express");
const { getProfile, getUserById, updateProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:id", getUserById);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// POST: Logout (Protected)
router.post("/logout", protect, (req, res) => {
  res.status(200).json({
    message: "Logout successful (remove token client-side)"
  });
});

module.exports = router;
