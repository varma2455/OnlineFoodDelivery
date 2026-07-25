const OTP = require("../models/OTP");
const sendSMS = require("../utils/sendSMS");

// Send OTP
const sendOTP = async (req, res) => {

    try {

        // Logic will be added in the next step

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

// Verify OTP
const verifyOTP = async (req, res) => {

    try {

        // Logic will be added later

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

module.exports = {
    sendOTP,
    verifyOTP
};