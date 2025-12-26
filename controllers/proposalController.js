const Proposal = require("../models/Proposal");
const Job = require("../models/Job");

// FREELANCER → Submit proposal
exports.submitProposal = async (req, res) => {
  if (req.user.role !== "freelancer") {
    return res.status(403).json({ message: "Only freelancers can bid" });
  }

  const job = await Job.findById(req.body.jobId);
  if (!job) return res.status(404).json({ message: "Job not found" });

  const proposalExists = await Proposal.findOne({
    job: job._id,
    freelancer: req.user._id,
  });

  if (proposalExists) {
    return res.status(400).json({ message: "Already bid on this job" });
  }

  const proposal = await Proposal.create({
    job: job._id,
    freelancer: req.user._id,
    coverLetter: req.body.coverLetter,
    bidAmount: req.body.bidAmount,
    deliveryTime: req.body.deliveryTime,
  });

  res.status(201).json(proposal);
};

// FREELANCER → View own proposals
exports.getMyProposals = async (req, res) => {
  const proposals = await Proposal.find({
    freelancer: req.user._id,
  }).populate("job", "title status");

  res.json(proposals);
};
