import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
{
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
        default: function() {
            return "user_" + new mongoose.Types.ObjectId().toString();
        }
    },

    fullName: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Invalid Email"]
    },

    password: {
        type: String,
        select: false
    },

    phone: {
        type: String,
        default: ""
    },

    address: {
        type: String,
        default: ""
    },

    profileImage: {
        type: String,
        default: "default-user.png"
    },

    role: {
        type: String,
        enum: ["customer", "restaurant", "delivery", "admin"],
        default: "customer"
    },
    isVerified: {
        type: Boolean,
        default: false
    },

    isBlocked: {
        type: Boolean,
        default: false
    },

    cart: [
        {
            food: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Food"
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ],


    wallet: {
        type: Number,
        default: 0
    },
    
    rewardPoints: {
        type: Number,
        default: 0
    },
    
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food"
    }],
    
    recentOrders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    }],
    
    savedAddresses: [{
        title: { type: String, default: "Home" },
        address: { type: String, required: true },
        houseNo: { type: String, default: "" },
        street: { type: String, default: "" },
        landmark: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        pincode: { type: String, default: "" },
        phone: { type: String, default: "" },
        fullName: { type: String, default: "" },
        isDefault: { type: Boolean, default: false }
    }],
    
    coupons: [{
        code: String,
        discount: Number,
        expiry: Date
    }],

    membership: {
        plan: {
            type: String,
            enum: ["free", "silver", "gold", "platinum", "Free", "Silver", "Gold", "Platinum", "Basic", "Premium"],
            default: "free"
        },
        billingCycle: {
            type: String,
            enum: ["monthly", "yearly"],
            default: "monthly"
        },
        status: {
            type: String,
            enum: ["active", "expired", "cancelled", "none", "free"],
            default: "free"
        },
        startDate: {
            type: Date,
            default: null
        },
        expiryDate: {
            type: Date,
            default: null
        },
        price: {
            type: Number,
            default: 0
        },
        autoRenew: {
            type: Boolean,
            default: true
        },
        paymentId: {
            type: String,
            default: ""
        },
        benefits: [{
            type: String
        }]
    },
    
    city: {
        type: String,
        default: ""
    },

    dateOfBirth: {
        type: String,
        default: ""
    },

    gender: {
        type: String,
        enum: ["Male", "Female", "Other", ""],
        default: ""
    },

    notifications: {
        orderUpdates: { type: Boolean, default: true },
        deliveryUpdates: { type: Boolean, default: true },
        offersPromotions: { type: Boolean, default: true },
        rewards: { type: Boolean, default: true }
    },
    
    notificationCount: {
        type: Number,
        default: 0
    },

    savedOffers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Offer"
    }],

    preferences: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    isDeactivated: {
        type: Boolean,
        default: false
    },

    deactivatedAt: {
        type: Date
    }

},
{
    timestamps: true
}
);

// Hash password before save if modified
userSchema.pre("save", async function(next) {
    if (!this.isModified("password") || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;