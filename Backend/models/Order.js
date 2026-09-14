import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    subtotal: {
      type: Number,
      required: true,
    },

    foodType: {
      type: String,
      default: "",
    },

    customization: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: "Order must contain at least one food item.",
      },
    },

    deliveryAddress: {
      fullName: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      addressLine1: {
        type: String,
        required: true,
      },

      addressLine2: {
        type: String,
        default: "",
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      postalCode: {
        type: String,
        required: true,
      },

      country: {
        type: String,
        default: "India",
      },
    },

    paymentMethod: {
      type: String,
      enum: ["Cash on Delivery", "UPI", "Card", "Net Banking", "Wallet"],
      default: "Cash on Delivery",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "Placed",
        "Confirmed",
        "Preparing",
        "Ready for Pickup",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Placed",
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    deliveryCharge: {
      type: Number,
      default: 40,
    },

    tax: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    memberDiscount: {
      type: Number,
      default: 0,
    },

    memberPlan: {
      type: String,
      default: "",
    },

    memberDeliveryBenefit: {
      type: Boolean,
      default: false,
    },

    finalAmount: {
      type: Number,
      required: true,
    },

    estimatedDeliveryTime: {
      type: Number,
      default: 30,
    },

    deliveredAt: {
      type: Date,
    },

    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
      default: null,
      index: true,
    },

    deliveryPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
      default: null,
      index: true,
    },

    deliveryStatus: {
      type: String,
      enum: [
        "unassigned",
        "Available",
        "Assigned",
        "Accepted",
        "Going to Restaurant",
        "Arrived at Restaurant",
        "Order Picked Up",
        "Going to Customer",
        "Arrived at Customer",
        "Delivered",
        "Cancelled",
      ],
      default: "unassigned",
      index: true,
    },

    deliveryEarnings: {
      type: Number,
      default: 50,
    },

    deliveryAssignedAt: {
      type: Date,
      default: null,
    },

    deliveryAcceptedAt: {
      type: Date,
      default: null,
    },

    deliveryPickedUpAt: {
      type: Date,
      default: null,
    },

    delivery: {
      status: {
        type: String,
        default: "unassigned",
      },
      deliveryPartnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeliveryPartner",
        default: null,
      },
      deliveryPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeliveryPartner",
        default: null,
      },
      assignedAt: {
        type: Date,
        default: null,
      },
      acceptedAt: {
        type: Date,
        default: null,
      },
      pickedUpAt: {
        type: Date,
        default: null,
      },
      deliveredAt: {
        type: Date,
        default: null,
      },
      otpHash: {
        type: String,
        default: null,
      },
      otpEncrypted: {
        type: String,
        default: null,
      },
      otpGeneratedAt: {
        type: Date,
        default: null,
      },
      otpVerifiedAt: {
        type: Date,
        default: null,
      },
      otpAttempts: {
        type: Number,
        default: 0,
      },
      otpLockedUntil: {
        type: Date,
        default: null,
      },
      otpExpiresAt: {
        type: Date,
        default: null,
      },
      emergencyOverride: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ "items.restaurantId": 1, orderStatus: 1, createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;