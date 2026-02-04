const User = require("../models/User");
const Job = require("../models/Job");
const Payment = require("../models/Payment");
const CommissionWithdrawal = require("../models/CommissionWithdrawal");

// Verify user (Freelancer or Client)
exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isVerified = !user.isVerified;
    await user.save();

    res.json({ message: `User ${user.isVerified ? 'verified' : 'unverified'} successfully`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle user active status (Soft delete)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot deactivate an admin" });
    }

    user.isActive = user.isActive === false ? true : false;
    await user.save();

    res.json({
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
      user: {
        _id: user._id,
        isActive: user.isActive
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get platform report
exports.getPlatformStats = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const jobsCount = await Job.countDocuments();
    const payments = await Payment.find().populate("client freelancer job");
    const totalEscrow = payments.filter(p => p.status === 'escrow').reduce((acc, p) => acc + p.amount, 0);
    const totalRevenue = payments.reduce((acc, p) => acc + (p.commissionAmount || 0), 0);

    const withdrawals = await CommissionWithdrawal.find();
    const totalWithdrawn = withdrawals.reduce((acc, w) => acc + w.amount, 0);
    const currentBalance = totalRevenue - totalWithdrawn;

    res.json({
      totalUsers: usersCount,
      totalJobs: jobsCount,
      totalEscrow: totalEscrow,
      totalRevenue: totalRevenue,
      totalWithdrawn: totalWithdrawn,
      currentBalance: currentBalance
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET all payments (Admin only)
exports.getPlatformPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("client freelancer job").sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET all jobs (Admin only)
exports.getAllJobsAdmin = async (req, res) => {
  try {
    const jobs = await Job.find().populate("client freelancer").sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE job
exports.deleteJob = async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET jobs posted by the current admin
exports.getMyAdminJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ client: req.user._id })
      .populate("client freelancer")
      .sort({ createdAt: -1 });

    const Proposal = require("../models/Proposal");
    const Payment = require("../models/Payment");

    const jobsWithProposals = await Promise.all(jobs.map(async (job) => {
      const payment = await Payment.findOne({ job: job._id }).select("status");

      if (job.status === 'open') {
        const proposals = await Proposal.find({ job: job._id })
          .populate("freelancer", "name email skills profilePicture")
          .select("freelancer bidAmount coverLetter status createdAt");
        return { ...job.toObject(), proposals, payment };
      }
      return { ...job.toObject(), payment };
    }));

    res.json(jobsWithProposals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
