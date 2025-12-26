const User = require("../models/User");
const Job = require("../models/Job");

// Verify freelancer
exports.verifyFreelancer = async (req, res) => {
  const freelancer = await User.findById(req.params.id);

  if (!freelancer || freelancer.role !== "freelancer") {
    return res.status(404).json({ message: "Freelancer not found" });
  }

  freelancer.isVerified = true;
  await freelancer.save();

  res.json({ message: "Freelancer verified successfully" });
};

// Get platform report
exports.getPlatformStats = async (req, res) => {
  const users = await User.countDocuments();
  const jobs = await Job.countDocuments();

  res.json({
    totalUsers: users,
    totalJobs: jobs,
  });
};
