import mongoose from "mongoose";

const deliveryPartnerApplicationSchema = new mongoose.Schema(
    {
        applicationId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },

        ownerName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true
        },

        email: {
            type: String,
            required: [true, "Email address is required"],
            lowercase: true,
            trim: true,
            index: true
        },

        phone: {
            type: String,
            required: [true, "Mobile number is required"],
            trim: true
        },

        dateOfBirth: {
            type: String,
            default: ""
        },

        gender: {
            type: String,
            enum: ["Male", "Female", "Other", "Prefer not to say"],
            default: "Male"
        },

        profilePhoto: {
            type: String,
            default: "default-user.png"
        },

        address: {
            street: { type: String, default: "" },
            city: { type: String, required: true, trim: true },
            state: { type: String, required: true, default: "Telangana", trim: true },
            pincode: { type: String, required: true, trim: true }
        },

        vehicleType: {
            type: String,
            enum: ["Bike", "Scooter", "Bicycle", "Electric Bike", "Car"],
            required: [true, "Vehicle type is required"],
            default: "Bike"
        },

        vehicleNumber: {
            type: String,
            default: "",
            trim: true
        },

        licenseNumber: {
            type: String,
            default: "",
            trim: true
        },

        experience: {
            type: String,
            default: "0-1 years"
        },

        drivingLicenseDocument: {
            type: String,
            default: ""
        },

        vehicleRcDocument: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: [
                "pending",
                "under_review",
                "changes_requested",
                "approved",
                "rejected",
                "suspended",
                "cancelled"
            ],
            default: "pending",
            index: true
        },

        rejectionReason: {
            type: String,
            default: ""
        },

        changesRequestedReason: {
            type: String,
            default: ""
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        reviewedAt: {
            type: Date
        },

        deliveryPartnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryPartner"
        },

        invitationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryInvitation"
        },

        auditLogs: [
            {
                action: { type: String },
                performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                note: { type: String, default: "" },
                timestamp: { type: Date, default: Date.now }
            }
        ]
    },
    {
        timestamps: true
    }
);

deliveryPartnerApplicationSchema.index({ status: 1, createdAt: -1 });
deliveryPartnerApplicationSchema.index({ email: 1, status: 1 });
deliveryPartnerApplicationSchema.index({ "address.city": 1 });
deliveryPartnerApplicationSchema.index({ vehicleType: 1 });

const DeliveryPartnerApplication = mongoose.model(
    "DeliveryPartnerApplication",
    deliveryPartnerApplicationSchema
);

export default DeliveryPartnerApplication;
