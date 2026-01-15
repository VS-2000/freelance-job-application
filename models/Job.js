const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: String,
    description: String,
    budget: Number,
    deadline: Date,
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "completed", "expired"],
      default: "open",
    },
    category: {
      type: String,
      required: true,
      enum: ["Web Dev", "Design", "Writing", "Marketing", "Data Science", "Others"]
    },
    experienceLevel: {
      type: String,
      enum: ["Entry", "Intermediate", "Expert"],
      default: "Intermediate"
    },
    submission: {
      url: String,
      description: String,
      submittedAt: Date
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
