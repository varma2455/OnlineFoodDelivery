import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: [true, "Food item is required"],
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate cart entries for the same user and food item
cartSchema.index({ user: 1, food: 1 }, { unique: true });

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;