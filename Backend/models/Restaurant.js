import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    logo: {
      type: String,
      default: "default-restaurant.png",
    },

    coverImage: {
      type: String,
      default: "default-cover.jpg",
    },

    email: {
      type: String,
      required: [true, "Restaurant email is required"],
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Restaurant phone is required"],
      trim: true,
    },

    address: {
      street: { type: String, default: "" },
      city: { type: String, required: true, trim: true, index: true },
      state: { type: String, default: "", trim: true },
      pincode: { type: String, required: true, trim: true },
    },

    cuisineTypes: {
      type: [String],
      default: ["Indian"],
    },

    restaurantType: {
      type: String,
      enum: ["Veg", "Non-Veg", "Both"],
      default: "Both",
    },

    openingTime: {
      type: String,
      default: "09:00 AM",
    },

    closingTime: {
      type: String,
      default: "11:00 PM",
    },

    deliveryAvailable: {
      type: Boolean,
      default: true,
    },

    minimumOrderAmount: {
      type: Number,
      default: 100,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      default: 40,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended", "closed"],
      default: "pending",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: false,
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    suspensionReason: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound and single indexes for performance
restaurantSchema.index({ ownerId: 1, status: 1 });
restaurantSchema.index({ "address.city": 1, status: 1 });
restaurantSchema.index({ name: "text", description: "text", cuisineTypes: "text" });

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;
