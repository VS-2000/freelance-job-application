const User = require("../models/User");
const Withdrawal = require("../models/Withdrawal");
const Payment = require("../models/Payment");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// GET freelancer wallet data (balance + history)
exports.getWalletData = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("walletBalance");

        // Recent earnings (released payments)
        const earnings = await Payment.find({
            freelancer: req.user._id,
            status: "released"
        }).sort({ updatedAt: -1 }).limit(10).populate("job", "title");

        // Recent withdrawals
        const withdrawals = await Withdrawal.find({
            freelancer: req.user._id
        }).sort({ createdAt: -1 }).limit(10);

        res.json({
            success: true,
            balance: user.walletBalance,
            earnings,
            withdrawals
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST request withdrawal
exports.requestWithdrawal = async (req, res) => {
    try {
        const { amount, method, details } = req.body;
        const user = await User.findById(req.user._id);

        if (amount > user.walletBalance) {
            return res.status(400).json({ success: false, message: "Insufficient balance" });
        }

        if (amount < 500) { // Minimum withdrawal limit example
            return res.status(400).json({ success: false, message: "Minimum withdrawal amount is ₹500" });
        }

        // 1. Create withdrawal record
        const withdrawal = await Withdrawal.create({
            freelancer: req.user._id,
            amount,
            method,
            details,
            status: "pending"
        });

        // 2. Deduct from wallet balance immediately (or mark as pending)
        user.walletBalance -= amount;
        await user.save();

        // 3. Optional: Process Stripe Payout if method is 'bank'
        // This requires Stripe Connect (Custom or Express) accounts for freelancers.
        // For now, we will mark it as pending for admin approval or simulate success if requested.

        /* 
        if (method === 'bank') {
          try {
            const payout = await stripe.payouts.create({
              amount: amount * 100, // INR to paise
              currency: 'inr',
              // destination: user.stripeBankAccountId, // Would need this in User model
            });
            withdrawal.stripePayoutId = payout.id;
            withdrawal.status = 'completed'; // If instant payout is supported
            await withdrawal.save();
          } catch (stripeErr) {
            console.error("Stripe Payout Error:", stripeErr);
            // If payout fails, we might want to revert the balance or keep it pending for manual fix
          }
        }
        */

        res.status(201).json({
            success: true,
            message: "Withdrawal request submitted successfully",
            withdrawal
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
