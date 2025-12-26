const Review = require("../models/Review");

// POST review
exports.addReview = async (req, res) => {
  const review = await Review.create({
    job: req.body.job,
    reviewer: req.user._id,
    reviewee: req.body.reviewee,
    rating: req.body.rating,
    comment: req.body.comment,
  });

  res.status(201).json(review);
};

// GET reviews for user
exports.getUserReviews = async (req, res) => {
  const reviews = await Review.find({
    reviewee: req.params.userId,
  }).populate("reviewer", "name");

  res.json(reviews);
};
