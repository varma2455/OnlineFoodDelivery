import mongoose from "mongoose";

const membershipHistorySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        plan: {
            type: String,
            enum: ["silver", "gold", "platinum"],
            required: true
        },
        planTitle: {
            type: String,
            required: true
        },
        billingCycle: {
            type: String,
            enum: ["monthly", "yearly"],
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        paymentMethod: {
            type: String,
            enum: ["Wallet", "UPI", "Card", "Net Banking"],
            default: "Card"
        },
        paymentStatus: {
            type: String,
            enum: ["Successful", "Failed", "Pending", "Cancelled"],
            default: "Successful"
        },
        transactionId: {
            type: String,
            required: true
        },
        startDate: {
            type: Date,
            default: Date.now
        },
        expiryDate: {
            type: Date,
            required: true
        },
        benefitsAwarded: {
            walletCashback: {
                type: Number,
                default: 0
            },
            rewardPoints: {
                type: Number,
                default: 0
            }
        }
    },
    {
        timestamps: true
    }
);

membershipHistorySchema.index({ user: 1, createdAt: -1 });

const MembershipHistory = mongoose.model("MembershipHistory", membershipHistorySchema);

export default MembershipHistory;
