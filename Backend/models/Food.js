import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Food name is required"],
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Pizza",
        "Burger",
        "Biryani",
        "Chinese",
        "South Indian",
        "North Indian",
        "Desserts",
        "Beverages",
        "Fast Food",
        "Snacks",
        "Salads",
        "Sea Food"
      ],
    },

    price: {
      type: Number,
      required: true,
      min: 1,
    },

    discountPrice: {
      type: Number,
      default: 0,
    },

    image: {
      type: String,
      required: true,
    },

    isVeg: {
      type: Boolean,
      default: true,
    },

    preparationTime: {
      type: Number,
      default: 20,
    },

    stock: {
      type: Number,
      default: 100,
    },

    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    restaurant: {
      type: String,
      default: "Online Food Delivery",
    }
  },
  {
    timestamps: true,
  }
);

const Food = mongoose.model("Food", foodSchema);

export default Food;