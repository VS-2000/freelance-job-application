const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: false, // Made optional for direct admin messages
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        isAdminMessage: {
            type: Boolean,
            default: false, // True if this is a direct admin message (no job)
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
