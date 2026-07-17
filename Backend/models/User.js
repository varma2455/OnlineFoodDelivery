import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
{
    firebaseUid: {
        type: String,
        required: true,
        unique: true,
        index: true
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
        required: true
    },

    address: {
        type: String,
        required: true
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
        title: String,
        address: String
    }],
    
    coupons: [{
        code: String,
        discount: Number,
        expiry: Date
    }],

    membership: {
        type: String,
        enum: ["Basic", "Silver", "Gold", "Premium"],
        default: "Basic"
    },
    
    city: {
        type: String,
        default: ""
    },
    
    notificationCount: {
        type: Number,
        default: 0
    }

},
{
    timestamps: true
}
);

const User = mongoose.model("User", userSchema);

export default User;