import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true
    },
    category: {
      type: String,
      enum: [
        "wallet_topup",
        "order_payment",
        "refund",
        "cashback",
        "membership_fee",
        "delivery_earning",
        "tip",
        "bonus",
        "withdrawal"
      ],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    balanceAfter: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "Card", "Net Banking", "Wallet", "Cash on Delivery"],
      default: "UPI"
    },
    description: {
      type: String,
      default: ""
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order"
    },
    status: {
      type: String,
      enum: ["Success", "Pending", "Failed"],
      default: "Success"
    }
  },
  {
    timestamps: true
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
