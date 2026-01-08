const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        message: { type: String, required: true },
        status: {
            type: String,
            enum: ['pending', 'responded'],
            default: 'pending'
        },
        adminResponse: {
            message: { type: String },
            respondedAt: { type: Date }
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
