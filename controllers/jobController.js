const Job = require("../models/Job");
const Proposal = require("../models/Proposal");

// CLIENT → Create Job
exports.createJob = async (req, res) => {
  if (req.user.role !== "client" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Only clients or admins can post jobs" });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({ message: "Your account must be verified by an admin to post jobs." });
  }

  const job = await Job.create({
    client: req.user._id,
    title: req.body.title,
    description: req.body.description,
    budget: req.body.budget,
    deadline: req.body.deadline,
    category: req.body.category,
    experienceLevel: req.body.experienceLevel
  });

  res.status(201).json(job);
};

// PUBLIC → Get all open jobs with filtering
exports.getAllJobs = async (req, res) => {
  try {
    const { keyword, category, minBudget, maxBudget } = req.query;

    let query = { status: "open" };

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = Number(minBudget);
      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }

    const jobs = await Job.find(query).populate(
      "client",
      "name email isVerified"
    ).sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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
    "name email skills isVerified"
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

  // Update job status and link freelancer
  proposal.job.status = "in-progress";
  proposal.job.freelancer = proposal.freelancer;
  await proposal.job.save();

  res.json({ message: "Proposal accepted", proposal });
};

// GET single job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("client", "name email isVerified");
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// FREELANCER → Submit Work
exports.submitWork = async (req, res) => {
  try {
    const { url, description } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the assigned freelancer can submit work" });
    }

    job.submission = {
      url,
      description,
      submittedAt: Date.now()
    };
    await job.save();

    res.json({ message: "Work submitted successfully", job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CLIENT → Approve Work & Release Funds
exports.approveWork = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    job.status = "completed";
    await job.save();

    // Update payment record to released
    const Payment = require("../models/Payment");
    await Payment.findOneAndUpdate(
      { job: job._id, status: "escrow" },
      { status: "released" }
    );

    res.json({ message: "Job completed and funds released", job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET my jobs (as client or freelancer)
exports.getMyJobs = async (req, res) => {
  try {
    const query = (req.user.role === 'client' || req.user.role === 'admin')
      ? { client: req.user._id }
      : { freelancer: req.user._id };

    let jobs = await Job.find(query)
      .populate("freelancer", "name skills")
      .populate("client", "name email isVerified")
      .sort({ createdAt: -1 });

    // For clients, if job is in-progress or completed, we might want the accepted bid amount
    // We can fetch this from the Proposal model if needed, or just use the job budget.
    // Let's stick to populating what we have for now.

    // If client or admin, for 'open' jobs, let's attach proposal summaries
    if (req.user.role === 'client' || req.user.role === 'admin') {
      const Proposal = require("../models/Proposal");
      const Payment = require("../models/Payment");

      const jobsWithProposals = await Promise.all(jobs.map(async (job) => {
        const payment = await Payment.findOne({ job: job._id }).select("status");
        if (job.status === 'open') {
          const proposals = await Proposal.find({ job: job._id })
            .populate("freelancer", "name skills")
            .select("freelancer bidAmount coverLetter");
          return { ...job.toObject(), proposals, payment };
        }
        return { ...job.toObject(), payment };
      }));
      return res.json(jobsWithProposals);
    }

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE job
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check authorization: must be the client who posted it
    if (job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to edit this job" });
    }

    const { title, description, budget, category, experienceLevel, deadline, status } = req.body;

    if (title) job.title = title;
    if (description) job.description = description;
    if (budget) job.budget = budget;
    if (category) job.category = category;
    if (experienceLevel) job.experienceLevel = experienceLevel;
    if (deadline) job.deadline = deadline;
    if (status) job.status = status;

    await job.save();
    res.json({ message: "Job updated successfully", job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DECLINE PROPOSAL
exports.declineProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.proposalId).populate("job");
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });

    if (proposal.job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    proposal.status = "rejected";
    await proposal.save();

    res.json({ message: "Proposal declined", proposal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
