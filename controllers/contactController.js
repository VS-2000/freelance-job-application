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

// @desc    Get all contact messages (Admin only)
// @route   GET /api/contact/admin
// @access  Private/Admin
exports.getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Respond to contact message (Admin only)
// @route   PUT /api/contact/:id/respond
// @access  Private/Admin
exports.respondToContact = async (req, res) => {
    try {
        const { response } = req.body;

        if (!response) {
            return res.status(400).json({ message: "Please provide a response message" });
        }

        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            {
                status: 'responded',
                adminResponse: {
                    message: response,
                    respondedAt: new Date()
                }
            },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({ message: "Contact message not found" });
        }

        res.json({
            message: "Response sent successfully",
            contact
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get user's contact messages with responses
// @route   GET /api/contact/my-messages
// @access  Public (by email)
exports.getUserContactMessages = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const contacts = await Contact.find({
            email,
            status: 'responded'
        }).sort({ createdAt: -1 });

        res.json(contacts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
