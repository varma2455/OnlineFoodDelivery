import mongoose from "mongoose";

const rewardCatalogSchema = new mongoose.Schema(
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
    description: {
      type: String,
      default: "",
      trim: true
    },
    pointsCost: {
      type: Number,
      required: true,
      min: 1
    },
    rewardType: {
      type: String,
      enum: ["discount_flat", "discount_percent", "free_delivery", "wallet_cashback"],
      required: true,
      default: "discount_flat"
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0
    },
    minimumOrderValue: {
      type: Number,
      default: 0
    },
    maximumDiscount: {
      type: Number,
      default: 0
    },
    validityDays: {
      type: Number,
      default: 30
    },
    applicableCategories: [
      {
        type: String,
        trim: true
      }
    ],
    icon: {
      type: String,
      default: "🎁"
    },
    badge: {
      type: String,
      default: ""
    },
    badgeColor: {
      type: String,
      default: "#ff5200"
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    termsAndConditions: [
      {
        type: String
      }
    ],
    stock: {
      type: Number,
      default: 9999
    },
    timesRedeemed: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const RewardCatalog = mongoose.model("RewardCatalog", rewardCatalogSchema);

export default RewardCatalog;
