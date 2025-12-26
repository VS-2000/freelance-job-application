const Job = require("../models/Job");
const Proposal = require("../models/Proposal");

// CLIENT → Create Job
exports.createJob = async (req, res) => {
  if (req.user.role !== "client") {
    return res.status(403).json({ message: "Only clients can post jobs" });
  }

  const job = await Job.create({
    client: req.user._id,
    title: req.body.title,
    description: req.body.description,
    budget: req.body.budget,
    deadline: req.body.deadline,
  });

  res.status(201).json(job);
};

// PUBLIC → Get all open jobs
exports.getAllJobs = async (req, res) => {
  const jobs = await Job.find({ status: "open" }).populate(
    "client",
    "name email"
  );
  res.json(jobs);
};

// CLIENT → View proposals for a job
exports.getJobProposals = async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) return res.status(404).json({ message: "Job not found" });

  if (job.client.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const proposals = await Proposal.find({ job: job._id }).populate(
    "freelancer",
    "name email skills"
  );

  res.json(proposals);
};

// CLIENT → Accept proposal
exports.acceptProposal = async (req, res) => {
  const proposal = await Proposal.findById(req.params.proposalId).populate(
    "job"
  );

  if (!proposal) return res.status(404).json({ message: "Proposal not found" });

  if (proposal.job.client.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  proposal.status = "accepted";
  await proposal.save();

  // Update job status
  proposal.job.status = "in-progress";
  await proposal.job.save();

  res.json({ message: "Proposal accepted", proposal });
};
