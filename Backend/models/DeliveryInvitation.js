import mongoose from "mongoose";

const deliveryInvitationSchema = new mongoose.Schema(
    {
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryPartnerApplication",
            required: true,
            index: true
        },

        deliveryPartnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryPartner",
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

deliveryInvitationSchema.index({ tokenHash: 1, status: 1 });
deliveryInvitationSchema.index({ email: 1, status: 1 });

const DeliveryInvitation = mongoose.model(
    "DeliveryInvitation",
    deliveryInvitationSchema
);

export default DeliveryInvitation;
