const CommissionWithdrawal = require("../models/CommissionWithdrawal");
const Payment = require("../models/Payment");

// Get commission balance and history
exports.getCommissionData = async (req, res) => {
    try {
        const payments = await Payment.find();
        const totalRevenue = payments.reduce((acc, p) => acc + (p.commissionAmount || 0), 0);

        const withdrawals = await CommissionWithdrawal.find().sort({ createdAt: -1 });
        const totalWithdrawn = withdrawals.reduce((acc, w) => acc + w.amount, 0);

        const currentBalance = totalRevenue - totalWithdrawn;

        res.json({
            totalEarned: totalRevenue,
            totalWithdrawn,
            currentBalance,
            withdrawals
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Withdraw commission
exports.withdrawCommission = async (req, res) => {
    try {
        const { amount, method, details } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid withdrawal amount" });
        }

        // Check balance
        const payments = await Payment.find();
        const totalRevenue = payments.reduce((acc, p) => acc + (p.commissionAmount || 0), 0);

        const withdrawals = await CommissionWithdrawal.find();
        const totalWithdrawn = withdrawals.reduce((acc, w) => acc + w.amount, 0);

        const currentBalance = totalRevenue - totalWithdrawn;

        if (amount > currentBalance) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        const withdrawal = new CommissionWithdrawal({
            admin: req.user._id,
            amount,
            method, // Pass the structured method object directly
            details, // Pass the structured details object directly
            status: "completed" // Simulating instant completion
        });

        await withdrawal.save();
        res.status(201).json({ message: "Withdrawal successful", withdrawal });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
