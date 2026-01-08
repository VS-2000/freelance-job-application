const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/Payment");

/**
 * STRIPE WEBHOOK HANDLER
 */
const stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        console.log(`⚓ Stripe Webhook Received: ${event.type}`);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const paymentId = paymentIntent.metadata.paymentId;

        try {
            const payment = await Payment.findById(paymentId);
            if (payment && payment.status !== "released") {
                await Payment.findByIdAndUpdate(paymentId, { status: "released" });
                console.log(`✅ Payment ${paymentId} marked as released.`);
            } else {
                console.log(`ℹ️ Payment ${paymentId} already released or not found.`);
            }
        } catch (dbError) {
            console.error(`❌ DB Update Error: ${dbError.message}`);
        }
    }

    if (event.type === "payment_intent.payment_failed") {
        const paymentIntent = event.data.object;
        const paymentId = paymentIntent.metadata.paymentId;

        try {
            await Payment.findByIdAndUpdate(paymentId, { status: "failed" });
            console.log(`❌ Payment ${paymentId} marked as failed.`);
        } catch (dbError) {
            console.error(`❌ DB Update Error: ${dbError.message}`);
        }
    }

    res.json({ received: true });
};

module.exports = { stripeWebhook };
