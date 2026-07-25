import OTP from "../models/OTP.js";
import sendSMS from "../utils/sendSMS.js";

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

export { sendOTP, verifyOTP };