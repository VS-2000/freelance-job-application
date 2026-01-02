const User = require("../models/User");

exports.getProfile = async (req, res) => {
  res.json({
    success: true,
    message: "Profile fetched successfully",
    data: req.user,
  });
};

exports.getUserById = async (req, res) => {
  try {
    const Job = require("../models/Job");
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Calculate Stats
    let stats = {
      jobsCount: 0,
      totalMoney: 0 // Spent for client, Earned for freelancer
    };

    if (user.role === "client") {
      const jobs = await Job.find({ client: user._id });
      stats.jobsCount = jobs.length;
      stats.totalMoney = jobs
        .filter(j => j.status === 'completed' || j.status === 'in-progress')
        .reduce((acc, curr) => acc + (curr.budget || 0), 0);
    } else if (user.role === "freelancer") {
      const jobs = await Job.find({ freelancer: user._id, status: 'completed' });
      stats.jobsCount = jobs.length;
      stats.totalMoney = jobs.reduce((acc, curr) => acc + (curr.budget || 0), 0);
    }

    res.json({ ...user.toObject(), stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { title, bio, location, hourlyRate, skills, portfolio } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          title,
          bio,
          location,
          hourlyRate,
          skills,
          portfolio,
        }
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: error.message });
  }
};
