const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: ["https://freelance-job-application-devlance.vercel.app", "http://localhost:5173"],
  credentials: true,
}));

// Stripe Webhook needs raw body before express.json()
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes")); // ✅ STRIPE
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/proposals", require("./routes/proposalRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));

app.get("/", (req, res) => {
  res.send("Freelance Platform your backend is running");
});

// ERROR HANDLERS
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

app.use(notFound);
app.use(errorHandler);

const path = require("path");

if (process.env.NODE_ENV === "production") {
  app.use(
    express.static(
      path.join(__dirname, "../frontend/freelance-job-platform/dist")
    )
  );

  // ✅ SAFE fallback for React routing (NO path)
  app.use((req, res) => {
    res.sendFile(
      path.resolve(
        __dirname,
        "../frontend",
        "freelance-job-platform",
        "dist",
        "index.html"
      )
    );
  });
}


const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
