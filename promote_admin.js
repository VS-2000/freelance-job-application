const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./models/User");

dotenv.config();

const promoteToAdmin = async (email) => {
    try {
        await connectDB();

        const user = await User.findOne({ email });

        if (!user) {
            console.error(`❌ User with email ${email} not found.`);
            process.exit(1);
        }

        user.role = "admin";
        user.isVerified = true;
        await user.save();

        console.log(`✅ User ${email} has been promoted to Admin and verified.`);
        process.exit(0);
    } catch (error) {
        console.error(`❌ Error promoting user: ${error.message}`);
        process.exit(1);
    }
};

const email = "vishnusudar32@gmail.com";
promoteToAdmin(email);
