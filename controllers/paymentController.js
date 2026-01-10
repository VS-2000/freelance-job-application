const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/Payment");

/**
 * CREATE STRIPE PAYMENT INTENT
 */
const createPayment = async (req, res) => {
  try {
    const { amount, jobId } = req.body;
    let { freelancerId } = req.body;
    const Job = require("../models/Job");

    if (!amount || !jobId) {
      return res.status(400).json({
        success: false,
        message: "Payment amount and Job ID are required",
      });
    }

    // Automatically get freelancerId if missing
    if (!freelancerId) {
      const job = await Job.findById(jobId);
      if (job && job.freelancer) {
        freelancerId = job.freelancer;
      }
    }

    // 1. Create a "pending" payment record in our DB first
    const newPayment = await Payment.create({
      job: jobId,
      client: req.user._id, // From 'protect' middleware
      freelancer: freelancerId,
      amount: amount,
      commissionAmount: amount * 0.10, // 10% commission
      status: "escrow", // Or "pending"
    });

    // 2. Create Stripe PaymentIntent with metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // INR → paise
      currency: "inr",
      payment_method_types: ["card"],
      metadata: {
        paymentId: newPayment._id.toString(),
        jobId: jobId,
        clientId: req.user._id.toString(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Stripe payment intent created and recorded",
      clientSecret: paymentIntent.client_secret,
      paymentId: newPayment._id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * SIMULATE PAYMENT (For Demo Purposes)
 * Bypasses Stripe and directly approves the job/payment
 */
const simulatePayment = async (req, res) => {
  try {
    const { amount, jobId } = req.body;
    let { freelancerId } = req.body;
    const Job = require("../models/Job");

    if (!amount || !jobId) {
      return res.status(400).json({
        success: false,
        message: "Payment amount and Job ID are required",
      });
    }

    // Automatically get freelancerId if missing
    if (!freelancerId) {
      const job = await Job.findById(jobId);
      if (job && job.freelancer) {
        freelancerId = job.freelancer;
      }
    }

    // 1. Create an "escrow" payment record
    const newPayment = await Payment.create({
      job: jobId,
      client: req.user._id,
      freelancer: freelancerId,
      amount: amount,
      commissionAmount: amount * 0.10, // 10% commission
      status: "escrow",
      transactionId: "DEMO-" + Date.now(),
    });

    // 2. Update Job status to "in-progress" if it wasn't already
    await Job.findByIdAndUpdate(jobId, { status: "in-progress" });

    res.status(200).json({
      success: true,
      message: "Payment simulated successfully",
      paymentId: newPayment._id,
    });
  } catch (error) {
    console.error("Simulation Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { createPayment, simulatePayment };
