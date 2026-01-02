const Message = require("../models/Message");

// SEND MESSAGE
exports.sendMessage = async (req, res) => {
    try {
        const { jobId, receiverId, content } = req.body;

        if (!content) return res.status(400).json({ message: "Content is required" });

        const message = await Message.create({
            job: jobId,
            sender: req.user._id,
            receiver: receiverId,
            content,
        });

        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET MESSAGES for a specific job conversation
exports.getMessages = async (req, res) => {
    try {
        const { jobId, otherUserId } = req.params;

        const messages = await Message.find({
            job: jobId,
            $or: [
                { sender: req.user._id, receiver: otherUserId },
                { sender: otherUserId, receiver: req.user._id },
            ],
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET INBOX (Latest messages from different conversations)
exports.getInbox = async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [{ sender: req.user._id }, { receiver: req.user._id }]
        })
            .sort({ createdAt: -1 })
            .populate("sender receiver", "name email")
            .populate("job", "title");

        // Group by job & the other user to create unique conversation previews
        const conversations = [];
        const seen = new Set();

        for (const msg of messages) {
            const otherUser = msg.sender._id.toString() === req.user._id.toString() ? msg.receiver : msg.sender;
            const conversationId = `${msg.job._id}_${otherUser._id}`;

            if (!seen.has(conversationId)) {
                seen.add(conversationId);
                conversations.push({
                    job: msg.job,
                    otherUser,
                    lastMessage: msg.content,
                    time: msg.createdAt,
                    unread: !msg.isRead && msg.receiver._id.toString() === req.user._id.toString()
                });
            }
        }

        res.json(conversations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
