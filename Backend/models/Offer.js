import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    subtitle: {
      type: String,
      default: "",
      trim: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    discountType: {
      type: String,
      enum: ["percentage", "flat", "free_delivery", "wallet_bonus", "reward_multiplier"],
      default: "percentage"
    },
    discountValue: {
      type: Number,
      required: true
    },
    minimumOrderValue: {
      type: Number,
      default: 0
    },
    maximumDiscount: {
      type: Number,
      default: 0
    },
    category: {
      type: String,
      enum: ["all", "food", "restaurants", "delivery", "new_user", "wallet", "rewards", "limited_time"],
      default: "food",
      index: true
    },
    applicableCategories: [
      {
        type: String,
        trim: true
      }
    ],
    applicableRestaurants: [
      {
        type: String,
        trim: true
      }
    ],
    isNewUserOnly: {
      type: Boolean,
      default: false
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true
    },
    usageLimit: {
      type: Number,
      default: 10000
    },
    usedCount: {
      type: Number,
      default: 0
    },
    perUserLimit: {
      type: Number,
      default: 1
    },
    usedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order"
        },
        usedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    termsAndConditions: [
      {
        type: String
      }
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    highlightTag: {
      type: String,
      default: ""
    },
    badgeColor: {
      type: String,
      default: "#ff5200"
    },
    city: {
      type: String,
      default: "All"
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual to check if offer is currently valid
offerSchema.virtual("isExpired").get(function () {
  return new Date() > this.expiryDate;
});

// Virtual alias for promoCode
offerSchema.virtual("promoCode").get(function () {
  return this.code;
});

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;
