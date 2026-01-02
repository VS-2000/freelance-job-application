const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amount: Number,
    status: {
      type: String,
      enum: ["escrow", "released", "failed"],
      default: "escrow",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
