import mongoose from "mongoose";

const supportFAQSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["Orders", "Delivery", "Payments", "Refunds", "Wallet", "Rewards", "Account", "Restaurant"],
      required: true,
      index: true
    },
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true,
      trim: true
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

supportFAQSchema.index({ question: "text", answer: "text", tags: "text" });

const SupportFAQ = mongoose.model("SupportFAQ", supportFAQSchema);

export default SupportFAQ;
