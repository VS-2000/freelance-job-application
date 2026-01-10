const express = require("express");
const {
  getAllJobs,
  createJob,
  getJobProposals,
  acceptProposal,
  getJobById,
  submitWork,
  approveWork,
  getMyJobs,
  updateJob,
  declineProposal
} = require("../controllers/jobController");
const { protect, optionalProtect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllJobs);
router.get("/my", protect, getMyJobs);
router.post("/", protect, createJob);
router.get("/:id", optionalProtect, getJobById);
router.get("/:id/proposals", protect, getJobProposals);
router.put("/:id/accept/:proposalId", protect, acceptProposal);
router.post("/:id/submit", protect, submitWork);
router.put("/:id/approve", protect, approveWork);
router.put("/:id", protect, updateJob);
router.put("/:id/decline/:proposalId", protect, declineProposal);

module.exports = router;
