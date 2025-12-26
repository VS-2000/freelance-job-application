const express = require("express");
const {
  createJob,
  getAllJobs,
  getJobProposals,
  acceptProposal,
} = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllJobs);
router.post("/", protect, createJob);
router.get("/:id/proposals", protect, getJobProposals);
router.put("/accept/:proposalId", protect, acceptProposal);

module.exports = router;
