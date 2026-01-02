const express = require("express");
const {
  submitProposal,
  getMyProposals,
} = require("../controllers/proposalController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, submitProposal);
router.get("/my", protect, getMyProposals);

module.exports = router;
