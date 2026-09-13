import mongoose from "mongoose";

const deliveryPartnerSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },

        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryPartnerApplication",
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        profilePhoto: {
            type: String,
            default: "default-user.png"
        },

        vehicleType: {
            type: String,
            enum: ["Bike", "Scooter", "Bicycle", "Electric Bike", "Car"],
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

        city: {
            type: String,
            default: "Hyderabad",
            trim: true
        },

        state: {
            type: String,
            default: "Telangana",
            trim: true
        },

        pincode: {
            type: String,
            default: "500001",
            trim: true
        },

        status: {
            type: String,
            enum: ["approved", "suspended", "inactive"],
            default: "approved",
            index: true
        },

        availabilityStatus: {
            type: String,
            enum: ["online", "offline", "busy"],
            default: "offline",
            index: true
        },

        currentLocation: {
            latitude: { type: Number, default: 17.385 },
            longitude: { type: Number, default: 78.4867 },
            updatedAt: { type: Date, default: Date.now }
        },

        rating: {
            type: Number,
            default: 5.0,
            min: 1.0,
            max: 5.0
        },

        totalDeliveries: {
            type: Number,
            default: 0
        },

        completedDeliveries: {
            type: Number,
            default: 0
        },

        cancelledDeliveries: {
            type: Number,
            default: 0
        },

        totalEarnings: {
            type: Number,
            default: 0
        },

        walletBalance: {
            type: Number,
            default: 0
        },

        joinedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

deliveryPartnerSchema.index({ status: 1, availabilityStatus: 1 });
deliveryPartnerSchema.index({ city: 1, status: 1 });

const DeliveryPartner = mongoose.model("DeliveryPartner", deliveryPartnerSchema);

export default DeliveryPartner;
