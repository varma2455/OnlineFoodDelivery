import mongoose from "mongoose";

const rewardVoucherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    reward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RewardCatalog"
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    rewardType: {
      type: String,
      enum: ["discount_flat", "discount_percent", "free_delivery", "wallet_cashback"],
      required: true
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
    expiryDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["Available", "Used", "Expired"],
      default: "Available",
      index: true
    },
    usedAt: {
      type: Date
    },
    usedInOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order"
    }
  },
  {
    timestamps: true
  }
);

rewardVoucherSchema.virtual("isExpired").get(function () {
  return new Date() > this.expiryDate;
});

const RewardVoucher = mongoose.model("RewardVoucher", rewardVoucherSchema);

export default RewardVoucher;
