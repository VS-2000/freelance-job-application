const User = require("../models/User");

exports.getProfile = async (req, res) => {
  res.json({
    success: true,
    message: "Profile fetched successfully",
    data: req.user,
  });
};
