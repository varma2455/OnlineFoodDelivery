import OTP from "../models/OTP.js";
import sendSMS from "../utils/sendSMS.js";

// Send OTP
const sendOTP = async (req, res) => {

    try {

        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Remove old OTP
        await OTP.deleteOne({ phone });

        // Save new OTP
        await OTP.create({
            phone,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });

        // Send OTP (currently logs to console)
        await sendSMS(phone, otp);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};


// Verify OTP
const verifyOTP = async (req, res) => {

    try {

        const { phone, otp } = req.body;

        const record = await OTP.findOne({ phone });

        if (!record) {
            return res.status(400).json({
                success: false,
                message: "OTP not found"
            });
        }

        if (record.expiresAt < new Date()) {
            await OTP.deleteOne({ phone });

            return res.status(400).json({
                success: false,
                message: "OTP expired"
            });
        }

        if (record.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        await OTP.deleteOne({ phone });

        return res.status(200).json({
            success: true,
            message: "Phone verified successfully"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

export { sendOTP, verifyOTP };