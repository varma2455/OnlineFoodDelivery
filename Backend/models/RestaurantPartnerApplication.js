import mongoose from "mongoose";

const restaurantPartnerApplicationSchema = new mongoose.Schema(
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
            required: [true, "Owner name is required"],
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
            required: [true, "Contact number is required"],
            trim: true
        },

        restaurantName: {
            type: String,
            required: [true, "Restaurant name is required"],
            trim: true
        },

        description: {
            type: String,
            default: "",
            trim: true
        },

        cuisineTypes: {
            type: [String],
            default: ["Indian"]
        },

        restaurantType: {
            type: String,
            enum: ["Veg", "Non-Veg", "Both"],
            default: "Both"
        },

        address: {
            street: { type: String, default: "" },
            city: { type: String, required: true, trim: true },
            state: { type: String, default: "Telangana", trim: true },
            pincode: { type: String, required: true, trim: true }
        },

        businessEmail: {
            type: String,
            lowercase: true,
            trim: true,
            default: ""
        },

        openingTime: {
            type: String,
            default: "09:00 AM"
        },

        closingTime: {
            type: String,
            default: "11:00 PM"
        },

        minimumOrderAmount: {
            type: Number,
            default: 100,
            min: 0
        },

        deliveryFee: {
            type: Number,
            default: 40,
            min: 0
        },

        gstNumber: {
            type: String,
            default: "",
            trim: true
        },

        fssaiNumber: {
            type: String,
            default: "",
            trim: true
        },

        businessRegistrationNumber: {
            type: String,
            default: "",
            trim: true
        },

        status: {
            type: String,
            enum: ["pending", "changes_requested", "approved", "rejected", "cancelled"],
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

        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant"
        },

        invitationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RestaurantInvitation"
        }
    },
    {
        timestamps: true
    }
);

restaurantPartnerApplicationSchema.index({ email: 1, status: 1 });
restaurantPartnerApplicationSchema.index({ "address.city": 1, status: 1 });

const RestaurantPartnerApplication = mongoose.model(
    "RestaurantPartnerApplication",
    restaurantPartnerApplicationSchema
);

export default RestaurantPartnerApplication;
