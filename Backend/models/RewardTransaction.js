import mongoose from "mongoose";

const rewardTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ["earned", "redeemed", "bonus", "expired"],
      required: true,
      index: true
    },
    points: {
      type: Number,
      required: true
    },
    balanceAfter: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      index: true
    },
    orderIdText: {
      type: String,
      default: ""
    },
    reward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RewardCatalog"
    },
    voucherCode: {
      type: String,
      default: ""
    },
    expiresAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ["active", "redeemed", "expired"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

rewardTransactionSchema.index({ user: 1, createdAt: -1 });

const RewardTransaction = mongoose.model("RewardTransaction", rewardTransactionSchema);

export default RewardTransaction;
