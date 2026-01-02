const express = require("express");
const { createPayment } = require("../controllers/paymentController");
const { stripeWebhook } = require("../controllers/webhookController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE STRIPE PAYMENT
router.post("/create", protect, createPayment);

// STRIPE WEBHOOK
router.post("/webhook", stripeWebhook);

// SIMULATE PAYMENT (DEMO)
router.post("/simulate", protect, createPayment.simulatePayment || require("../controllers/paymentController").simulatePayment);

module.exports = router;
