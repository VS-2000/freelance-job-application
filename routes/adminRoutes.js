const express = require("express");
const {
    verifyUser,
    getPlatformStats,
    getPlatformPayments,
    getAllUsers,
    getAllJobsAdmin,
    deleteUser,
    deleteJob,
    updatePaymentStatus
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.put("/verify/:id", protect, adminOnly, verifyUser);
router.delete("/users/:id", protect, adminOnly, deleteUser);
router.get("/stats", protect, adminOnly, getPlatformStats);
router.get("/payments", protect, adminOnly, getPlatformPayments);
router.put("/payments/:id", protect, adminOnly, updatePaymentStatus);
router.get("/users", protect, adminOnly, getAllUsers);
router.get("/jobs", protect, adminOnly, getAllJobsAdmin);
router.delete("/jobs/:id", protect, adminOnly, deleteJob);

router.get("/my-jobs", protect, adminOnly, require("../controllers/adminController").getMyAdminJobs);

module.exports = router;
