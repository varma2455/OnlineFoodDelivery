const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
{
    phone: {
        type: String,
        required: true,
        trim: true
    },

    otp: {
        type: String,
        required: true
    },

    expiresAt: {
        type: Date,
        required: true
    },

    verified: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
}
);

export default mongoose.model("OTP", otpSchema);