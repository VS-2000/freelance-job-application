const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
    {
        freelancer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        method: {
            type: String,
            enum: ["bank", "upi"],
            required: true,
        },
        details: {
            accountNumber: String,
            ifscCode: String,
            bankName: String,
            upiId: String,
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
        },
        stripePayoutId: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Withdrawal", withdrawalSchema);
