import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import User from "../models/User.js";
import { verifyFirebaseToken } from "../config/firebaseAdmin.js";

/**
 * Generate JWT Token
 */
const generateToken = (userId, role = "customer") => {
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET || "foodexpress_secret_jwt_key_2025",
        { expiresIn: "7d" }
    );
};

/**
 * Register New User
 * POST /api/auth/register
 */
export const registerUser = async (req, res, next) => {
    try {
        let fbUser = req.firebaseUser;
        if (!fbUser && req.body.idToken) {
            fbUser = await verifyFirebaseToken(req.body.idToken);
        }

        let firebaseUid = fbUser?.uid;
        let email = fbUser?.email || req.body.email;
        let isVerified = fbUser?.email_verified || false;

        const {
            fullName,
            phone,
            address,
            city,
            password
        } = req.body;

        if (!fullName || !email) {
            return res.status(400).json({
                success: false,
                message: "Please provide your full name and email."
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address."
            });
        }

        // Check if user already exists
        const query = firebaseUid
            ? { $or: [{ firebaseUid }, { email: email.toLowerCase() }] }
            : { email: email.toLowerCase() };

        let existingUser = await User.findOne(query);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        // Default role is customer (protect against tampering)
        const user = await User.create({
            firebaseUid: firebaseUid || undefined,
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            password: password || undefined,
            phone: phone ? phone.trim() : "",
            address: address ? address.trim() : "",
            city: city ? city.trim() : "",
            role: "customer",
            isVerified,
            wallet: 100, // Welcome bonus wallet credit
            rewardPoints: 50, // Welcome reward points
            coupons: [
                {
                    code: "FIRST30",
                    discount: 30,
                    expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
            ]
        });

        const token = generateToken(user._id, user.role);

        return res.status(201).json({
            success: true,
            message: "Registration successful! Welcome to FoodExpress.",
            token,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                address: user.address,
                city: user.city,
                role: user.role,
                profileImage: user.profileImage,
                wallet: user.wallet,
                rewardPoints: user.rewardPoints,
                membership: user.membership
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login User
 * POST /api/auth/login
 */
export const loginUser = async (req, res, next) => {
    try {
        let fbUser = req.firebaseUser;
        if (!fbUser && req.body.idToken) {
            fbUser = await verifyFirebaseToken(req.body.idToken);
        }

        // Option 1: Firebase Auth token
        if (fbUser) {
            const firebaseUid = fbUser.uid;
            const email = (fbUser.email || "").toLowerCase();

            let user = await User.findOne({
                $or: [
                    { firebaseUid },
                    ...(email ? [{ email }] : [])
                ]
            });

            // Auto user registration if new Firebase user
            if (!user) {
                user = await User.create({
                    firebaseUid,
                    fullName: fbUser.name || (email ? email.split("@")[0] : "FoodExpress User"),
                    email: email || `${firebaseUid}@foodexpress.local`,
                    isVerified: Boolean(fbUser.email_verified),
                    role: "customer", // NEVER trust frontend role! Default is always customer
                    wallet: 100,
                    rewardPoints: 50,
                    coupons: [
                        {
                            code: "FIRST30",
                            discount: 30,
                            expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        }
                    ]
                });
            }

            if (user.isBlocked) {
                return res.status(403).json({
                    success: false,
                    message: "Your account has been blocked by an administrator."
                });
            }

            if (!user.firebaseUid) {
                user.firebaseUid = firebaseUid;
            }
            if (fbUser.email_verified) {
                user.isVerified = true;
            }
            await user.save();

            const token = generateToken(user._id, user.role);

            return res.status(200).json({
                success: true,
                message: "Login successful.",
                token,
                user: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    city: user.city,
                    role: user.role,
                    profileImage: user.profileImage,
                    wallet: user.wallet,
                    rewardPoints: user.rewardPoints,
                    membership: user.membership
                }
            });
        }

        // Option 2: Direct email + password login
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both email and password."
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked by the administrator."
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const token = generateToken(user._id, user.role);

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                address: user.address,
                city: user.city,
                role: user.role,
                profileImage: user.profileImage,
                wallet: user.wallet,
                rewardPoints: user.rewardPoints,
                membership: user.membership
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Profile
 * GET /api/auth/profile
 */
export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("favorites")
            .populate({
                path: "recentOrders",
                options: { sort: { createdAt: -1 }, limit: 5 }
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const { fullName, name, phone, address, city, profileImage, dateOfBirth, gender, notifications } = req.body;
        const resolvedName = fullName !== undefined ? fullName : name;

        if (resolvedName !== undefined) user.fullName = resolvedName.trim();
        if (phone !== undefined) user.phone = phone.trim();
        if (address !== undefined) user.address = address.trim();
        if (city !== undefined) user.city = city.trim();
        if (profileImage !== undefined) user.profileImage = profileImage;
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
        if (gender !== undefined) user.gender = gender;
        if (notifications && typeof notifications === "object") {
            user.notifications = {
                ...user.notifications,
                ...notifications
            };
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Change Password
 * PUT /api/auth/change-password
 */
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters."
            });
        }

        const user = await User.findById(req.user._id).select("+password");

        if (user.password) {
            const isMatch = await user.matchPassword(currentPassword || "");
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: "Current password does not match."
                });
            }
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully."
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Toggle Favorite Food
 * POST /api/auth/favorites/toggle
 */
export const toggleFavorite = async (req, res, next) => {
    try {
        const { foodId } = req.body;
        if (!foodId) {
            return res.status(400).json({
                success: false,
                message: "Food ID is required."
            });
        }

        const user = await User.findById(req.user._id);
        const index = user.favorites.findIndex(id => id.toString() === foodId.toString());

        let isFavorite = false;
        if (index > -1) {
            user.favorites.splice(index, 1);
            isFavorite = false;
        } else {
            user.favorites.push(foodId);
            isFavorite = true;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            isFavorite,
            message: isFavorite ? "Added to favorites" : "Removed from favorites",
            favorites: user.favorites
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Saved Addresses
 * GET /api/auth/addresses
 */
export const getSavedAddresses = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select("savedAddresses fullName phone address city");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        return res.status(200).json({
            success: true,
            savedAddresses: user.savedAddresses || [],
            data: user.savedAddresses || []
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add / Update / Set Default / Delete Saved Addresses
 */
export const addSavedAddress = async (req, res, next) => {
    try {
        let { title, type, fullName, phone, houseNo, street, landmark, city, state, pincode, address, isDefault } = req.body;

        if (!title && type) {
            title = type;
        }
        if (!address) {
            const addressParts = [houseNo, street, landmark, city, state, pincode].filter(Boolean);
            address = addressParts.length > 0 ? addressParts.join(", ") : "";
        }

        if (!address && !street && !houseNo) {
            return res.status(400).json({ success: false, message: "Address details are required." });
        }

        const user = await User.findById(req.user._id);

        const shouldBeDefault = Boolean(isDefault) || user.savedAddresses.length === 0;
        if (shouldBeDefault) {
            user.savedAddresses.forEach(addr => {
                addr.isDefault = false;
            });
            user.address = address;
            if (city) user.city = city;
        }

        user.savedAddresses.push({
            title: title || "Home",
            fullName: fullName || user.fullName,
            phone: phone || user.phone,
            houseNo: houseNo || "",
            street: street || "",
            landmark: landmark || "",
            city: city || user.city || "",
            state: state || "",
            pincode: pincode || "",
            address: address || "Home Address",
            isDefault: shouldBeDefault
        });

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Address saved successfully.",
            savedAddresses: user.savedAddresses,
            data: user.savedAddresses
        });
    } catch (error) {
        next(error);
    }
};

export const updateSavedAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;
        let { title, type, fullName, phone, houseNo, street, landmark, city, state, pincode, address, isDefault } = req.body;

        const user = await User.findById(req.user._id);
        const targetAddress = user.savedAddresses.id ? user.savedAddresses.id(addressId) : user.savedAddresses.find(a => a._id.toString() === addressId);

        if (!targetAddress) {
            return res.status(404).json({ success: false, message: "Address not found." });
        }

        if (title || type) targetAddress.title = title || type;
        if (fullName !== undefined) targetAddress.fullName = fullName;
        if (phone !== undefined) targetAddress.phone = phone;
        if (houseNo !== undefined) targetAddress.houseNo = houseNo;
        if (street !== undefined) targetAddress.street = street;
        if (landmark !== undefined) targetAddress.landmark = landmark;
        if (city !== undefined) targetAddress.city = city;
        if (state !== undefined) targetAddress.state = state;
        if (pincode !== undefined) targetAddress.pincode = pincode;

        if (address) {
            targetAddress.address = address;
        } else {
            const parts = [targetAddress.houseNo, targetAddress.street, targetAddress.landmark, targetAddress.city, targetAddress.state, targetAddress.pincode].filter(Boolean);
            if (parts.length > 0) targetAddress.address = parts.join(", ");
        }

        if (isDefault) {
            user.savedAddresses.forEach(addr => {
                addr.isDefault = addr._id.toString() === addressId;
            });
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Address updated successfully.",
            savedAddresses: user.savedAddresses,
            data: user.savedAddresses
        });
    } catch (error) {
        next(error);
    }
};

export const setDefaultSavedAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user._id);

        let found = false;
        user.savedAddresses.forEach(addr => {
            if (addr._id.toString() === addressId) {
                addr.isDefault = true;
                found = true;
                user.address = addr.address;
                if (addr.city) user.city = addr.city;
            } else {
                addr.isDefault = false;
            }
        });

        if (!found) {
            return res.status(404).json({ success: false, message: "Address not found." });
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Default address updated.",
            savedAddresses: user.savedAddresses,
            data: user.savedAddresses
        });
    } catch (error) {
        next(error);
    }
};

export const deleteSavedAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        const wasDefault = user.savedAddresses.some(
            a => a._id.toString() === req.params.addressId && a.isDefault
        );

        user.savedAddresses = user.savedAddresses.filter(
            a => a._id.toString() !== req.params.addressId
        );

        if (wasDefault && user.savedAddresses.length > 0) {
            user.savedAddresses[0].isDefault = true;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Address deleted successfully.",
            savedAddresses: user.savedAddresses,
            data: user.savedAddresses
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Logout User
 * POST /api/auth/logout
 */
export const logoutUser = async (req, res, next) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({
            success: true,
            message: "Logged out successfully."
        });
    } catch (error) {
        next(error);
    }
};
