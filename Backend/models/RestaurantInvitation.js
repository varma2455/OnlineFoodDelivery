import mongoose from "mongoose";

const restaurantInvitationSchema = new mongoose.Schema(
    {
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RestaurantPartnerApplication",
            required: true,
            index: true
        },

        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            index: true
        },

        email: {
            type: String,
            required: [true, "Invitation email is required"],
            lowercase: true,
            trim: true,
            index: true
        },

        tokenHash: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        status: {
            type: String,
            enum: ["pending", "used", "expired", "revoked"],
            default: "pending",
            index: true
        },

        expiresAt: {
            type: Date,
            required: true
        },

        usedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

restaurantInvitationSchema.index({ tokenHash: 1, status: 1 });
restaurantInvitationSchema.index({ email: 1, status: 1 });

const RestaurantInvitation = mongoose.model(
    "RestaurantInvitation",
    restaurantInvitationSchema
);

export default RestaurantInvitation;
