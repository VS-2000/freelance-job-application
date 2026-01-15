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
    commissionAmount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["escrow", "released", "failed", "refunded"],
      default: "escrow",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
