const mongoose = require("mongoose");

const commissionWithdrawalSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "completed", // Simulating instant completion for now
        },
        method: {
            type: String,
            enum: ["bank", "upi"],
            default: "bank",
        },
        details: {
            accountNumber: String,
            ifscCode: String,
            bankName: String,
            upiId: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("CommissionWithdrawal", commissionWithdrawalSchema);
