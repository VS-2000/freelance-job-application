const express = require("express");
const router = express.Router();
const { getWalletData, requestWithdrawal } = require("../controllers/walletController");
const { protect } = require("../middleware/authMiddleware");

// All wallet routes are protected
router.use(protect);

router.get("/data", getWalletData);
router.post("/withdraw", requestWithdrawal);

module.exports = router;
