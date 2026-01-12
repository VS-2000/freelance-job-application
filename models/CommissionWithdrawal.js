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
        bankDetails: {
            type: String, // Or Object for more detail
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("CommissionWithdrawal", commissionWithdrawalSchema);
