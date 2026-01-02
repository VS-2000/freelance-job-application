const Contact = require("../models/Contact");

// @desc    Submit contact message
// @route   POST /api/contact
// @access  Public
exports.submitContactMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: "Please provide all fields" });
        }

        const newMessage = await Contact.create({
            name,
            email,
            message,
        });

        res.status(201).json({
            message: "Message sent successfully! We will get back to you soon.",
            data: newMessage,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
