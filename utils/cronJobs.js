const cron = require("node-cron");
const Job = require("../models/Job");
const Payment = require("../models/Payment");

const initCronJobs = () => {
    // Run every hour to check for expired jobs
    cron.schedule("0 * * * *", async () => {
        console.log("Running cron job: Checking for expired jobs...");
        try {
            const now = new Date();

            // Find jobs that are in-progress and have passed the deadline
            const expiredJobs = await Job.find({
                status: "in-progress",
                deadline: { $lt: now },
                "submission.submittedAt": { $exists: false }
            });

            for (const job of expiredJobs) {
                console.log(`Job ${job._id} has expired. Processing refund...`);

                // 1. Mark job as "expired" (we might need to add this status to Job model)
                // For now, let's just mark it as "open" or add "expired" if we can.
                // Re-reading Job.js: enum: ["open", "in-progress", "completed"]
                // I'll update Job.js to include "expired"
                job.status = "expired";
                await job.save();

                // 2. Refund Payment
                const payment = await Payment.findOne({ job: job._id, status: "escrow" });
                if (payment) {
                    payment.status = "refunded";
                    await payment.save();
                    console.log(`Refunded payment ${payment._id} for job ${job._id}`);

                    // In a real scenario, you'd also call Stripe to refund the PaymentIntent.
                    // stripe.refunds.create({ payment_intent: payment.transactionId });
                }
            }
        } catch (error) {
            console.error("Error in expired jobs cron job:", error);
        }
    });
};

module.exports = initCronJobs;
