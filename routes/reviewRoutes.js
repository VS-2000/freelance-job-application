const express = require("express");
const {
  addReview,
  getUserReviews,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addReview);
router.get("/:userId", getUserReviews);

module.exports = router;
