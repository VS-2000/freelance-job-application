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
            .populate("sender receiver", "name email role")
            .populate("job", "title");

        // Group by job & the other user to create unique conversation previews
        const conversations = [];
        const seen = new Set();

        for (const msg of messages) {
            const otherUser = msg.sender._id.toString() === req.user._id.toString() ? msg.receiver : msg.sender;
            const conversationId = msg.job ? `${msg.job._id}_${otherUser._id}` : `direct_${otherUser._id}`;

            if (!seen.has(conversationId)) {
                seen.add(conversationId);
                conversations.push({
                    job: msg.job,
                    otherUser,
                    lastMessage: msg.content,
                    time: msg.createdAt,
                    unread: !msg.isRead && msg.receiver._id.toString() === req.user._id.toString(),
                    isAdminMessage: msg.isAdminMessage
                });
            }
        }

        res.json(conversations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// SEND DIRECT MESSAGE (Admin to User, no job required)
exports.sendDirectMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;

        if (!content) return res.status(400).json({ message: "Content is required" });
        if (!receiverId) return res.status(400).json({ message: "Receiver is required" });

        const message = await Message.create({
            sender: req.user._id,
            receiver: receiverId,
            content,
            isAdminMessage: true,
        });

        const populatedMessage = await Message.findById(message._id)
            .populate("sender receiver", "name email role");

        res.status(201).json(populatedMessage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET DIRECT MESSAGES (conversation between two users without job context)
exports.getDirectMessages = async (req, res) => {
    try {
        const { otherUserId } = req.params;

        const messages = await Message.find({
            isAdminMessage: true,
            $or: [
                { sender: req.user._id, receiver: otherUserId },
                { sender: otherUserId, receiver: req.user._id },
            ],
        })
            .sort({ createdAt: 1 })
            .populate("sender receiver", "name email role");

        // Mark messages as read
        await Message.updateMany(
            {
                isAdminMessage: true,
                sender: otherUserId,
                receiver: req.user._id,
                isRead: false
            },
            { isRead: true }
        );

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET ADMIN INBOX (for admin panel - shows all direct message conversations)
exports.getAdminInbox = async (req, res) => {
    try {
        const messages = await Message.find({
            isAdminMessage: true,
            $or: [{ sender: req.user._id }, { receiver: req.user._id }]
        })
            .sort({ createdAt: -1 })
            .populate("sender receiver", "name email role");

        // Group by the other user to create unique conversation previews
        const conversations = [];
        const seen = new Set();

        for (const msg of messages) {
            const otherUser = msg.sender._id.toString() === req.user._id.toString() ? msg.receiver : msg.sender;
            const conversationId = `direct_${otherUser._id}`;

            if (!seen.has(conversationId)) {
                seen.add(conversationId);
                conversations.push({
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
