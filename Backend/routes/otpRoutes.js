const express = require("express");
const router = express.Router();

const {
    sendOTP,
    verifyOTP
} = require("../controllers/otpController");

// Send OTP
router.post("/send", sendOTP);

// Verify OTP
router.post("/verify", verifyOTP);

module.exports = router;