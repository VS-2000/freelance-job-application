const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Job = require("./models/Job");
const User = require("./models/User");

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data to ensure "demo" projects are removed
        await Job.deleteMany();
        // await User.deleteMany({ email: "demo_client@example.com" });

        // 1. Create a Demo Client if not exists
        let client = await User.findOne({ email: "demo_client@example.com" });
        if (!client) {
            client = await User.create({
                name: "TechNova Solutions",
                email: "demo_client@example.com",
                password: "password123",
                role: "client",
            });
            console.log("✅ Demo Client created");
        }

        // 2. Real-World Sample Jobs
        const sampleJobs = [
            {
                client: client._id,
                title: "Healthcare SaaS Platform Development",
                description: "We are looking for a Senior Full-Stack team to build a HIPAA-compliant telemedicine platform. Features include video consultations, e-prescriptions, and patient record management. Stack: React, Node.js, PostgreSQL.",
                budget: 120000,
                deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                status: "open",
                category: "Web Dev",
                experienceLevel: "Expert"
            },
            {
                client: client._id,
                title: "AI-Powered Customer Support Chatbot",
                description: "Need an AI expert to integrate OpenAI API into our customer support portal. The bot should handle common queries, escalate complex issues, and learn from past interactions.",
                budget: 35000,
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: "open",
                category: "Data Science",
                experienceLevel: "Expert"
            },
            {
                client: client._id,
                title: "Fintech Mobile App UI/UX Redesign",
                description: "Our investment app needs a complete visual overhaul. We want a clean, modern, dark-mode-first design that simplifies complex data visualization for users.",
                budget: 25000,
                deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
                status: "open",
                category: "Design",
                experienceLevel: "Expert"
            },
            {
                client: client._id,
                title: "SEO Strategy for E-commerce Brand",
                description: "Fashion retailer seeking an SEO specialist to audit our site, improve organic rankings, and create a content strategy for the upcoming holiday season.",
                budget: 8500,
                deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                status: "open",
                category: "Marketing",
                experienceLevel: "Intermediate"
            },
            {
                client: client._id,
                title: "Smart Contract Audit for DeFi Protocol",
                description: "We are launching a new decentralized exchange and need a security audit of our Solidity smart contracts to ensure no vulnerabilities before mainnet launch.",
                budget: 50000,
                deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                status: "open",
                category: "Web Dev",
                experienceLevel: "Expert"
            },
            {
                client: client._id,
                title: "Technical Content Writer for Cloud Blog",
                description: "Write deep-dive tutorials on AWS, Kubernetes, and Serverless architectures. Target audience is DevOps engineers. Looking for 4 articles/month.",
                budget: 6000,
                deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                status: "open",
                category: "Writing",
                experienceLevel: "Intermediate"
            },
            {
                client: client._id,
                title: "Corporate explainer video animation",
                description: "Create a high-quality 60-second 2D animated explainer video for our new B2B software product. Voiceover and script provided.",
                budget: 4500,
                deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                status: "open",
                category: "Design",
                experienceLevel: "Intermediate"
            },
            {
                client: client._id,
                title: "Lead Generation Campaign Manager",
                description: "Manage and optimize our LinkedIn Ads and Google Ads campaigns to drive qualified leads for our enterprise software solutions.",
                budget: 15000,
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: "open",
                category: "Marketing",
                experienceLevel: "Expert"
            }
        ];

        await Job.insertMany(sampleJobs);
        console.log("✅ Sample Jobs added successfully");

        process.exit();
    } catch (error) {
        console.error(`❌ Error seeding data: ${error.message}`);
        process.exit(1);
    }
};

seedData();
