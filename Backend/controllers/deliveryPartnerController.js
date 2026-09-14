import mongoose from "mongoose";
import DeliveryPartnerApplication from "../models/DeliveryPartnerApplication.js";
import DeliveryInvitation from "../models/DeliveryInvitation.js";
import DeliveryPartner from "../models/DeliveryPartner.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";
import {
    generateInvitationToken,
    hashToken,
    getDeliveryInvitationUrl,
    generateDeliveryApplicationId
} from "../utils/invitationUtils.js";
import { verifyFirebaseToken } from "../config/firebaseAdmin.js";
import { verifyDeliveryOtpHash } from "../utils/deliveryOtpUtils.js";
import jwt from "jsonwebtoken";
import axios from "axios";

const FIREBASE_API_KEY =
    process.env.FIREBASE_WEB_API_KEY ||
    process.env.REACT_APP_FIREBASE_API_KEY ||
    "AIzaSyB63dXav-PnSWkqlbrjpyrWllCbCkEl1uM";

const generateJwtToken = (userId, role = "delivery") => {
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET || "foodexpress_secret_jwt_key_2025",
        { expiresIn: "7d" }
    );
};

/**
 * Sanitize order object for delivery partner endpoints.
 * Strictly guarantees that otpHash, otpEncrypted, and deliveryOtp are never leaked.
 */
const sanitizeDeliveryOrder = (order) => {
    if (!order) return order;
    const obj = typeof order.toObject === "function" ? order.toObject() : { ...order };
    if (obj.delivery) {
        obj.delivery = { ...obj.delivery };
        delete obj.delivery.otpHash;
        delete obj.delivery.otpEncrypted;
    }
    delete obj.deliveryOtp;
    return obj;
};

// =========================================================================
// 1. PUBLIC APPLICANT ENDPOINTS
// =========================================================================

/**
 * Submit Delivery Partner Application
 * POST /api/delivery-partner/apply
 */
export const applyForDeliveryPartnership = async (req, res, next) => {
    try {
        const {
            ownerName,
            email,
            phone,
            dateOfBirth,
            gender,
            profilePhoto,
            address,
            vehicleType,
            vehicleNumber,
            licenseNumber,
            experience,
            drivingLicenseDocument,
            vehicleRcDocument
        } = req.body;

        if (!ownerName || !email || !phone || !vehicleType) {
            return res.status(400).json({
                success: false,
                message: "Full name, email address, phone number, and vehicle type are required."
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if there is already an active pending application
        const existingApp = await DeliveryPartnerApplication.findOne({
            email: normalizedEmail,
            status: { $in: ["pending", "under_review", "changes_requested"] }
        });

        if (existingApp) {
            return res.status(200).json({
                success: true,
                message: "You already have an active delivery partnership application under review.",
                alreadySubmitted: true,
                application: existingApp
            });
        }

        // Generate unique Application ID
        let applicationId = generateDeliveryApplicationId();
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 5) {
            const collision = await DeliveryPartnerApplication.findOne({ applicationId });
            if (!collision) {
                isUnique = true;
            } else {
                applicationId = generateDeliveryApplicationId();
                attempts++;
            }
        }

        const application = await DeliveryPartnerApplication.create({
            applicationId,
            ownerName: ownerName.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            dateOfBirth: dateOfBirth || "",
            gender: gender || "Male",
            profilePhoto: profilePhoto || "default-user.png",
            address: {
                street: address?.street ? address.street.trim() : "",
                city: address?.city ? address.city.trim() : "Hyderabad",
                state: address?.state ? address.state.trim() : "Telangana",
                pincode: address?.pincode ? address.pincode.trim() : "500001"
            },
            vehicleType: vehicleType || "Bike",
            vehicleNumber: vehicleNumber ? vehicleNumber.trim().toUpperCase() : "",
            licenseNumber: licenseNumber ? licenseNumber.trim().toUpperCase() : "",
            experience: experience || "0-1 years",
            drivingLicenseDocument: drivingLicenseDocument || "",
            vehicleRcDocument: vehicleRcDocument || "",
            status: "pending"
        });

        return res.status(201).json({
            success: true,
            message: "Delivery partner application submitted successfully! Our verification team will review your details.",
            application
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Check Application Status
 * GET /api/delivery-partner/application-status
 */
export const getDeliveryApplicationStatus = async (req, res, next) => {
    try {
        const { applicationId, email } = req.query;
        let query = null;

        if (applicationId) {
            query = { applicationId: applicationId.trim().toUpperCase() };
        } else if (email) {
            query = { email: email.toLowerCase().trim() };
        } else if (req.user?.email) {
            query = { email: req.user.email.toLowerCase().trim() };
        }

        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Please provide an Application ID or email address to check status."
            });
        }

        const application = await DeliveryPartnerApplication.findOne(query)
            .sort({ createdAt: -1 })
            .populate("deliveryPartnerId", "name status availabilityStatus rating totalDeliveries")
            .populate("invitationId", "status expiresAt");

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "No delivery partner application found for the provided details."
            });
        }

        const status = application.status;
        const invitation = application.invitationId;

        // 5-Step Timeline
        const timeline = [
            {
                key: "submitted",
                title: "Application Submitted",
                status: "completed",
                date: application.createdAt
            },
            {
                key: "documents",
                title: "Documents Received",
                status: "completed",
                date: application.createdAt
            },
            {
                key: "verification",
                title: "Admin Verification",
                status:
                    status === "pending" || status === "under_review"
                        ? "current"
                        : status === "changes_requested"
                        ? "warning"
                        : "completed",
                reason: status === "changes_requested" ? application.changesRequestedReason : null
            },
            {
                key: "approved",
                title: status === "rejected" ? "Application Rejected" : "Approved",
                status: status === "approved" ? "completed" : status === "rejected" ? "failed" : "pending",
                reason: status === "rejected" ? application.rejectionReason : null
            },
            {
                key: "activation",
                title: "Account Activation",
                status: invitation && invitation.status === "used" ? "completed" : invitation ? "current" : "pending"
            }
        ];

        return res.status(200).json({
            success: true,
            application: {
                _id: application._id,
                applicationId: application.applicationId,
                ownerName: application.ownerName,
                email: application.email,
                phone: application.phone,
                vehicleType: application.vehicleType,
                vehicleNumber: application.vehicleNumber,
                licenseNumber: application.licenseNumber,
                address: application.address,
                status: application.status,
                rejectionReason: application.rejectionReason,
                changesRequestedReason: application.changesRequestedReason,
                createdAt: application.createdAt,
                updatedAt: application.updatedAt,
                deliveryPartner: application.deliveryPartnerId,
                hasActiveInvitation: Boolean(invitation && invitation.status === "pending" && invitation.expiresAt > new Date()),
                isAccountActivated: Boolean(invitation && invitation.status === "used")
            },
            timeline
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Validate and Retrieve Invitation Details
 * GET /api/delivery-partner/invitation/:token
 */
export const getDeliveryInvitationByToken = async (req, res, next) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Invitation token is required."
            });
        }

        const tokenHash = hashToken(token);
        const invitation = await DeliveryInvitation.findOne({ tokenHash })
            .populate("applicationId")
            .populate("deliveryPartnerId");

        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: "Invalid or nonexistent invitation link."
            });
        }

        if (invitation.status === "revoked") {
            return res.status(400).json({
                success: false,
                status: "revoked",
                message: "This delivery invitation has been revoked by an administrator."
            });
        }

        if (invitation.status === "used") {
            return res.status(400).json({
                success: false,
                status: "used",
                message: "This invitation has already been used to activate an account. Please proceed to login."
            });
        }

        if (invitation.expiresAt < new Date() || invitation.status === "expired") {
            invitation.status = "expired";
            await invitation.save();
            return res.status(400).json({
                success: false,
                status: "expired",
                message: "This invitation has expired. Please contact the administrator to resend your invitation."
            });
        }

        const app = invitation.applicationId;

        return res.status(200).json({
            success: true,
            invitation: {
                email: invitation.email,
                expiresAt: invitation.expiresAt,
                ownerName: app ? app.ownerName : "Delivery Partner",
                applicationId: app ? app.applicationId : "DP-PENDING",
                vehicleType: app ? app.vehicleType : "Bike",
                city: app ? app.address?.city : "Hyderabad"
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Activate Delivery Partner Account
 * POST /api/delivery-partner/activate
 */
export const activateDeliveryPartnerAccount = async (req, res, next) => {
    try {
        const { token, idToken, password, fullName, phone } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Invitation token is required."
            });
        }

        const tokenHash = hashToken(token);
        const invitation = await DeliveryInvitation.findOne({ tokenHash })
            .populate("applicationId");

        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: "Invalid invitation token."
            });
        }

        if (invitation.status === "used") {
            return res.status(400).json({
                success: false,
                message: "This invitation has already been used. Please log in directly."
            });
        }

        if (invitation.status === "revoked") {
            return res.status(400).json({
                success: false,
                message: "This invitation has been revoked."
            });
        }

        if (invitation.expiresAt < new Date()) {
            invitation.status = "expired";
            await invitation.save();
            return res.status(400).json({
                success: false,
                message: "This invitation has expired."
            });
        }

        const targetEmail = invitation.email.toLowerCase().trim();
        let firebaseUid = null;
        let verifiedEmail = null;

        // 1. Firebase Authentication Verification
        if (idToken) {
            const fbData = await verifyFirebaseToken(idToken);
            if (!fbData) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid Firebase ID token provided."
                });
            }

            verifiedEmail = fbData.email ? fbData.email.toLowerCase().trim() : null;
            firebaseUid = fbData.uid;

            // Security: Email matching enforcement
            if (verifiedEmail && verifiedEmail !== targetEmail) {
                return res.status(403).json({
                    success: false,
                    message: `This invitation was issued to "${targetEmail}", but the signed-in account is "${verifiedEmail}". Please activate with the correct email.`
                });
            }
        } else if (password) {
            try {
                const signUpRes = await axios.post(
                    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
                    {
                        email: targetEmail,
                        password,
                        returnSecureToken: true
                    }
                );
                firebaseUid = signUpRes.data.localId;
            } catch (signUpErr) {
                const errCode = signUpErr.response?.data?.error?.message;
                if (errCode === "EMAIL_EXISTS") {
                    try {
                        const signInRes = await axios.post(
                            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
                            {
                                email: targetEmail,
                                password,
                                returnSecureToken: true
                            }
                        );
                        firebaseUid = signInRes.data.localId;
                    } catch (signInErr) {
                        return res.status(400).json({
                            success: false,
                            message: "A Firebase account with this email already exists. Please enter your existing password."
                        });
                    }
                } else {
                    console.warn("Firebase Auth setup note:", errCode || signUpErr.message);
                }
            }
        }

        const app = invitation.applicationId;
        const finalName = (fullName || (app ? app.ownerName : "Delivery Partner")).trim();
        const finalPhone = (phone || (app ? app.phone : "")).trim();

        // 2. Find or Create/Update MongoDB User
        let user = await User.findOne({ email: targetEmail });

        if (user) {
            user.role = "delivery";
            user.isVerified = true;
            user.isActive = true;
            if (firebaseUid) user.firebaseUid = firebaseUid;
            if (password) user.password = password;
            if (finalName) user.fullName = finalName;
            if (finalPhone) user.phone = finalPhone;
            await user.save();
        } else {
            user = await User.create({
                fullName: finalName,
                email: targetEmail,
                phone: finalPhone,
                role: "delivery",
                isVerified: true,
                isActive: true,
                firebaseUid: firebaseUid || undefined,
                password: password || "DeliveryPartner123!"
            });
        }

        // 3. Find or Create/Update DeliveryPartner Record
        let deliveryPartner = null;

        if (invitation.deliveryPartnerId) {
            deliveryPartner = await DeliveryPartner.findById(invitation.deliveryPartnerId);
        }

        if (!deliveryPartner) {
            deliveryPartner = await DeliveryPartner.findOne({ userId: user._id });
        }

        if (deliveryPartner) {
            deliveryPartner.userId = user._id;
            deliveryPartner.status = "approved";
            deliveryPartner.name = finalName;
            deliveryPartner.phone = finalPhone;
            if (app) {
                deliveryPartner.applicationId = app._id;
                deliveryPartner.vehicleType = app.vehicleType || deliveryPartner.vehicleType;
                deliveryPartner.vehicleNumber = app.vehicleNumber || deliveryPartner.vehicleNumber;
                deliveryPartner.licenseNumber = app.licenseNumber || deliveryPartner.licenseNumber;
                deliveryPartner.city = app.address?.city || deliveryPartner.city;
                deliveryPartner.state = app.address?.state || deliveryPartner.state;
                deliveryPartner.pincode = app.address?.pincode || deliveryPartner.pincode;
            }
            await deliveryPartner.save();
        } else {
            deliveryPartner = await DeliveryPartner.create({
                userId: user._id,
                applicationId: app ? app._id : undefined,
                name: finalName,
                email: targetEmail,
                phone: finalPhone,
                vehicleType: app ? app.vehicleType : "Bike",
                vehicleNumber: app ? app.vehicleNumber : "",
                licenseNumber: app ? app.licenseNumber : "",
                city: app ? app.address?.city : "Hyderabad",
                state: app ? app.address?.state : "Telangana",
                pincode: app ? app.address?.pincode : "500001",
                status: "approved",
                availabilityStatus: "offline"
            });
        }

        // 4. Update Application and Invitation
        if (app) {
            app.status = "approved";
            app.deliveryPartnerId = deliveryPartner._id;
            await app.save();
        }

        invitation.status = "used";
        invitation.usedAt = new Date();
        invitation.deliveryPartnerId = deliveryPartner._id;
        await invitation.save();

        // 5. Generate Session Token
        const jwtToken = generateJwtToken(user._id, "delivery");

        return res.status(200).json({
            success: true,
            message: "Your FoodExpress Delivery Partner account has been activated successfully! 🚴",
            token: jwtToken,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                phone: user.phone
            },
            deliveryPartner: {
                _id: deliveryPartner._id,
                name: deliveryPartner.name,
                status: deliveryPartner.status,
                availabilityStatus: deliveryPartner.availabilityStatus,
                vehicleType: deliveryPartner.vehicleType
            }
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================================
// 2. PROTECTED DELIVERY PARTNER PORTAL ENDPOINTS
// =========================================================================

/**
 * Get Profile of Authenticated Delivery Partner
 * GET /api/delivery-partner/me
 * GET /api/delivery-partner/profile
 */
export const getMyDeliveryProfile = async (req, res, next) => {
    try {
        const partner = req.deliveryPartner;

        return res.status(200).json({
            success: true,
            deliveryPartner: partner,
            user: {
                _id: req.user._id,
                fullName: req.user.fullName,
                email: req.user.email,
                phone: req.user.phone,
                wallet: req.user.wallet
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Profile of Authenticated Delivery Partner
 * PUT /api/delivery-partner/profile
 */
export const updateDeliveryProfile = async (req, res, next) => {
    try {
        const partner = req.deliveryPartner;
        const { phone, profilePhoto, street, city, state, pincode } = req.body;

        if (phone) partner.phone = phone.trim();
        if (profilePhoto) partner.profilePhoto = profilePhoto;
        if (city) partner.city = city.trim();
        if (state) partner.state = state.trim();
        if (pincode) partner.pincode = pincode.trim();

        await partner.save();

        if (phone && req.user) {
            req.user.phone = phone.trim();
            await req.user.save();
        }

        return res.status(200).json({
            success: true,
            message: "Delivery partner profile updated successfully.",
            deliveryPartner: partner
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delivery Dashboard Overview
 * GET /api/delivery-partner/dashboard
 */
export const getDeliveryDashboard = async (req, res, next) => {
    try {
        const partner = req.deliveryPartner;

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // 1. Orders delivered today by this partner
        const todayDeliveredOrders = await Order.find({
            deliveryPartner: partner._id,
            deliveryStatus: "Delivered",
            deliveredAt: { $gte: startOfToday }
        });

        const todayDeliveriesCount = todayDeliveredOrders.length;
        const todayEarnings = todayDeliveredOrders.reduce(
            (sum, o) => sum + (o.deliveryEarnings || 50),
            0
        );

        // 2. Active delivery in progress or assigned to this partner
        const activeDelivery = await Order.findOne({
            deliveryPartner: partner._id,
            deliveryStatus: {
                $in: [
                    "Assigned",
                    "Accepted",
                    "Going to Restaurant",
                    "Arrived at Restaurant",
                    "Order Picked Up",
                    "Going to Customer",
                    "Arrived at Customer"
                ]
            }
        })
            .populate("items.restaurantId", "name address phone")
            .populate("user", "fullName phone address");

        // 3. Pending deliveries count
        const pendingCount = activeDelivery ? 1 : 0;

        return res.status(200).json({
            success: true,
            stats: {
                todayDeliveries: todayDeliveriesCount,
                completedDeliveries: partner.completedDeliveries || 0,
                pendingDeliveries: pendingCount,
                todayEarnings,
                totalEarnings: partner.totalEarnings || 0,
                walletBalance: partner.walletBalance || req.user?.wallet || 0,
                rating: partner.rating || 5.0,
                availabilityStatus: partner.availabilityStatus
            },
            activeDelivery,
            deliveryPartner: partner
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Availability (Online / Offline / Busy)
 * PUT /api/delivery-partner/availability
 */
export const updateAvailability = async (req, res, next) => {
    try {
        const partner = req.deliveryPartner;
        const { availabilityStatus } = req.body;

        if (!["online", "offline", "busy"].includes(availabilityStatus)) {
            return res.status(400).json({
                success: false,
                message: "Status must be 'online', 'offline', or 'busy'."
            });
        }

        partner.availabilityStatus = availabilityStatus;
        await partner.save();

        return res.status(200).json({
            success: true,
            message: `Availability updated to ${availabilityStatus.toUpperCase()}.`,
            availabilityStatus: partner.availabilityStatus
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Location
 * PUT /api/delivery-partner/location
 */
export const updateLocation = async (req, res, next) => {
    try {
        const partner = req.deliveryPartner;
        const { latitude, longitude } = req.body;

        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude are required."
            });
        }

        partner.currentLocation = {
            latitude: Number(latitude),
            longitude: Number(longitude),
            updatedAt: new Date()
        };

        await partner.save();

        return res.status(200).json({
            success: true,
            message: "Location updated.",
            currentLocation: partner.currentLocation
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Available Orders for Delivery
 * GET /api/delivery-partner/orders
 */
export const getAvailableOrders = async (req, res, next) => {
    try {
        const partner = req.deliveryPartner;

        // Only show orders specifically assigned to THIS partner waiting for acceptance
        const orders = await Order.find({
            deliveryPartner: partner._id,
            deliveryStatus: "Assigned"
        })
            .populate("items.restaurantId", "name address phone")
            .populate("user", "fullName phone")
            .sort({ createdAt: -1 })
            .limit(30);

        return res.status(200).json({
            success: true,
            total: orders.length,
            isOnline: partner.availabilityStatus === "online",
            orders: orders.map(sanitizeDeliveryOrder)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Order Details
 * GET /api/delivery-partner/orders/:id
 */
export const getOrderDetails = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("items.food", "name price image category")
            .populate("items.restaurantId", "name address phone email")
            .populate("user", "fullName phone address")
            .populate("deliveryPartner", "name phone vehicleType vehicleNumber rating");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        return res.status(200).json({
            success: true,
            order: sanitizeDeliveryOrder(order)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Accept Order (Atomic Backend Lock)
 * POST /api/delivery-partner/orders/:id/accept
 */
export const acceptOrder = async (req, res, next) => {
    try {
        const partner = req.deliveryPartner;

        // Check if partner already has an active incomplete delivery
        const existingActive = await Order.findOne({
            deliveryPartner: partner._id,
            deliveryStatus: {
                $in: [
                    "Accepted",
                    "Going to Restaurant",
                    "Arrived at Restaurant",
                    "Order Picked Up",
                    "Going to Customer",
                    "Arrived at Customer"
                ]
            }
        });

        if (existingActive) {
            return res.status(400).json({
                success: false,
                message: "You already have an active delivery in progress! Please complete it before accepting another."
            });
        }

        // Atomic lock: Only accepts if assigned to THIS partner in "Assigned" status
        const acceptedTime = new Date();
        const order = await Order.findOneAndUpdate(
            {
                _id: req.params.id,
                deliveryPartner: partner._id,
                deliveryStatus: "Assigned"
            },
            {
                $set: {
                    deliveryStatus: "Accepted",
                    deliveryAcceptedAt: acceptedTime,
                    "delivery.status": "Accepted",
                    "delivery.acceptedAt": acceptedTime
                }
            },
            { new: true }
        ).populate("items.restaurantId", "name address phone").populate("user", "fullName phone address");

        if (!order) {
            return res.status(400).json({
                success: false,
                message: "This order is not assigned to you or is no longer in 'Assigned' status."
            });
        }

        // Set partner availability to busy
        partner.availabilityStatus = "busy";
        await partner.save();

        return res.status(200).json({
            success: true,
            message: "Order accepted successfully! Please proceed to the restaurant.",
            order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Delivery Order Status
 * PUT /api/delivery-partner/orders/:id/status
 */
export const updateDeliveryOrderStatus = async (req, res, next) => {
    try {
        const partner = req.deliveryPartner;
        const { deliveryStatus } = req.body;

        const validTransitions = {
            Assigned: ["Accepted", "Cancelled"],
            Accepted: ["Going to Restaurant", "Cancelled"],
            "Going to Restaurant": ["Arrived at Restaurant"],
            "Arrived at Restaurant": ["Order Picked Up"],
            "Order Picked Up": ["Going to Customer"],
            "Going to Customer": ["Arrived at Customer"],
            "Arrived at Customer": ["Delivered"]
        };

        const order = await Order.findOne({
            _id: req.params.id,
            deliveryPartner: partner._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found or does not belong to your assigned deliveries."
            });
        }

        // Prevent delivery partner from marking an order Delivered without OTP verification
        if (deliveryStatus === "Delivered") {
            const isOtpVerified = Boolean(order.delivery?.otpVerifiedAt);
            if (!isOtpVerified && req.user.role !== "admin") {
                return res.status(400).json({
                    success: false,
                    message: "Delivery OTP verification required. Please verify the customer's 6-digit OTP to complete delivery."
                });
            }
        }

        const currentStatus = order.deliveryStatus || "Assigned";
        const allowedNext = validTransitions[currentStatus] || [];

        // Admin override allowed, but for partner must follow state transitions
        if (!allowedNext.includes(deliveryStatus) && req.user.role !== "admin") {
            return res.status(400).json({
                success: false,
                message: `Invalid state transition from "${currentStatus}" to "${deliveryStatus}". Allowed: ${allowedNext.join(", ")}`
            });
        }

        order.deliveryStatus = deliveryStatus;
        if (!order.delivery) {
            order.delivery = {};
        }
        order.delivery.status = deliveryStatus;

        if (deliveryStatus === "Accepted") {
            order.deliveryAcceptedAt = new Date();
            order.delivery.acceptedAt = order.deliveryAcceptedAt;
            partner.availabilityStatus = "busy";
            await partner.save();
        }

        if (deliveryStatus === "Order Picked Up") {
            order.orderStatus = "Out for Delivery";
            order.deliveryPickedUpAt = new Date();
            order.delivery.pickedUpAt = order.deliveryPickedUpAt;
        }

        // If marked Delivered (only reaches here if OTP was already verified or admin override)
        if (deliveryStatus === "Delivered") {
            order.orderStatus = "Delivered";
            order.paymentStatus = "Paid";
            order.deliveredAt = new Date();
            order.delivery.deliveredAt = order.deliveredAt;

            const earnings = order.deliveryEarnings || 50;

            // Credit earnings to DeliveryPartner & User
            partner.completedDeliveries = (partner.completedDeliveries || 0) + 1;
            partner.totalDeliveries = (partner.totalDeliveries || 0) + 1;
            partner.totalEarnings = (partner.totalEarnings || 0) + earnings;
            partner.walletBalance = (partner.walletBalance || 0) + earnings;
            partner.availabilityStatus = "online";
            await partner.save();

            const user = await User.findById(req.user._id);
            if (user) {
                user.wallet = (user.wallet || 0) + earnings;
                await user.save();

                // Record financial transaction
                await Transaction.create({
                    user: user._id,
                    type: "credit",
                    category: "delivery_earning",
                    amount: earnings,
                    balanceAfter: user.wallet,
                    paymentMethod: "Wallet",
                    description: `Delivery earnings for Order #${order._id.toString().slice(-6).toUpperCase()}`,
                    order: order._id,
                    status: "Success"
                });
            }
        }

        await order.save();

        return res.status(200).json({
            success: true,
            message: `Delivery status updated to: ${deliveryStatus}`,
            order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify Delivery OTP and Complete Handover
 * POST /api/delivery/orders/:id/verify-otp
 * POST /api/delivery-partner/orders/:id/verify-otp
 */
export const verifyDeliveryOtp = async (req, res, next) => {
    try {
        const partner = req.deliveryPartner;
        const { otp } = req.body;
        const orderId = req.params.orderId || req.params.id;

        if (!partner) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Delivery Partner profile required."
            });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        // 1. DELIVERY PARTNER OWNERSHIP (Section 11 & 28)
        // Verify order is assigned to THIS authenticated partner
        const assignedPartnerId = (
            order.deliveryPartner ||
            order.deliveryPartnerId ||
            order.delivery?.deliveryPartner ||
            order.delivery?.deliveryPartnerId
        )?.toString();

        if (!assignedPartnerId || assignedPartnerId !== partner._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized delivery assignment. You can only verify delivery OTP for orders assigned to you."
            });
        }

        // 2. ORDER STATUS VALIDATION (Section 12)
        if (order.orderStatus === "Cancelled" || order.deliveryStatus === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cannot verify OTP for a cancelled order."
            });
        }

        if (order.orderStatus === "Delivered" || order.deliveryStatus === "Delivered" || order.delivery?.status === "Delivered") {
            return res.status(400).json({
                success: false,
                message: "This order has already been marked as delivered."
            });
        }

        if (["Placed", "Confirmed", "Preparing"].includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Cannot verify OTP while order is ${order.orderStatus}. Handover verification requires active delivery.`
            });
        }

        // Handover stage validation
        const allowableDeliveryStages = ["Arrived at Customer", "Going to Customer", "Order Picked Up"];
        if (!allowableDeliveryStages.includes(order.deliveryStatus)) {
            return res.status(400).json({
                success: false,
                message: `Cannot verify delivery OTP at current delivery stage "${order.deliveryStatus}". You must be delivering to the customer.`
            });
        }

        // 3. BRUTE FORCE LOCKOUT PROTECTION (Section 15)
        if (order.delivery?.otpLockedUntil && new Date() < new Date(order.delivery.otpLockedUntil)) {
            const minutesLeft = Math.ceil((new Date(order.delivery.otpLockedUntil).getTime() - Date.now()) / (60 * 1000));
            return res.status(429).json({
                success: false,
                locked: true,
                message: `Too many incorrect OTP attempts. Verification is temporarily locked for ${minutesLeft} minute(s). Please contact support or ask the customer to regenerate their OTP.`
            });
        }

        // 4. OTP EXPIRY VALIDATION (Section 16)
        if (order.delivery?.otpExpiresAt && new Date() > new Date(order.delivery.otpExpiresAt)) {
            return res.status(400).json({
                success: false,
                expired: true,
                message: "Delivery verification code has expired. Please ask the customer to generate a new OTP."
            });
        }

        // 5. INPUT VALIDATION
        const cleanOtp = typeof otp === "string" ? otp.trim() : typeof otp === "number" ? String(otp).trim() : "";
        if (!cleanOtp || !/^\d{6}$/.test(cleanOtp)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid 6-digit numeric delivery OTP."
            });
        }

        if (!order.delivery?.otpHash) {
            return res.status(400).json({
                success: false,
                message: "No delivery verification OTP is registered for this order. Please ask the customer to refresh their order page."
            });
        }

        // 6. CRYPTOGRAPHIC HASH VERIFICATION (Section 10 & 35)
        // Log safe metadata only - NEVER log raw OTP (Section 35)
        console.log(`Delivery OTP verification attempted for order: ${order._id}`);

        const isValid = verifyDeliveryOtpHash(cleanOtp, order.delivery.otpHash, order._id.toString());

        if (!isValid) {
            if (!order.delivery) order.delivery = {};
            order.delivery.otpAttempts = (order.delivery.otpAttempts || 0) + 1;

            if (order.delivery.otpAttempts >= 5) {
                order.delivery.otpLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15-minute lockout
            }

            await order.save();

            // DO NOT reveal correct digits, hash, or which digit is wrong (Section 14)
            const remainingAttempts = Math.max(0, 5 - order.delivery.otpAttempts);
            return res.status(400).json({
                success: false,
                message: "Incorrect delivery OTP. Please ask the customer to provide the correct 6-digit delivery OTP.",
                remainingAttempts: remainingAttempts > 0 ? remainingAttempts : 0
            });
        }

        // 7. SUCCESSFUL VERIFICATION & DELIVERY COMPLETION (Section 13)
        const completionTime = new Date();
        if (!order.delivery) order.delivery = {};
        order.delivery.otpVerifiedAt = completionTime;
        order.delivery.status = "Delivered";
        order.delivery.deliveredAt = completionTime;
        order.delivery.otpAttempts = 0;
        order.delivery.otpLockedUntil = null;

        order.deliveryStatus = "Delivered";
        order.orderStatus = "Delivered";
        order.paymentStatus = "Paid";
        order.deliveredAt = completionTime;

        // Credit earnings using existing Transaction/Wallet system
        const earnings = order.deliveryEarnings || 50;

        partner.completedDeliveries = (partner.completedDeliveries || 0) + 1;
        partner.totalDeliveries = (partner.totalDeliveries || 0) + 1;
        partner.totalEarnings = (partner.totalEarnings || 0) + earnings;
        partner.walletBalance = (partner.walletBalance || 0) + earnings;
        partner.availabilityStatus = "online";
        await partner.save();

        const partnerUser = await User.findById(partner.userId || req.user._id);
        if (partnerUser) {
            partnerUser.wallet = (partnerUser.wallet || 0) + earnings;
            await partnerUser.save();

            await Transaction.create({
                user: partnerUser._id,
                type: "credit",
                category: "delivery_earning",
                amount: earnings,
                balanceAfter: partnerUser.wallet,
                paymentMethod: "Wallet",
                description: `Delivery earnings for Order #${order._id.toString().slice(-6).toUpperCase()}`,
                order: order._id,
                status: "Success"
            });
        }

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Delivery verified successfully.",
            orderStatus: "Delivered",
            deliveryStatus: "Delivered",
            deliveredAt: completionTime,
            order: {
                _id: order._id,
                orderStatus: "Delivered",
                deliveryStatus: "Delivered",
                deliveredAt: completionTime,
                deliveryEarnings: earnings
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get My Assigned Deliveries
 * GET /api/delivery-partner/my-deliveries
 */
export const getMyDeliveries = async (req, res, next) => {
    try {
        const partner = req.deliveryPartner;
        const { status } = req.query;

        const filter = { deliveryPartner: partner._id };

        if (status === "Active") {
            filter.deliveryStatus = {
                $in: [
                    "Assigned",
                    "Accepted",
                    "Going to Restaurant",
                    "Arrived at Restaurant",
                    "Order Picked Up",
                    "Going to Customer",
                    "Arrived at Customer"
                ]
            };
        } else if (status === "Completed") {
            filter.deliveryStatus = "Delivered";
        } else if (status === "Cancelled") {
            filter.deliveryStatus = "Cancelled";
        }

        const deliveries = await Order.find(filter)
            .populate("items.restaurantId", "name address phone")
            .populate("user", "fullName phone address")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            total: deliveries.length,
            deliveries: deliveries.map(sanitizeDeliveryOrder)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Earnings Breakdown
 * GET /api/delivery-partner/earnings
 */
export const getDeliveryEarnings = async (req, res, next) => {
    try {
        const partner = req.deliveryPartner;

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const allDeliveries = await Order.find({
            deliveryPartner: partner._id,
            deliveryStatus: "Delivered"
        });

        let todayEarnings = 0;
        let weekEarnings = 0;
        let monthEarnings = 0;
        let totalEarnings = 0;

        allDeliveries.forEach((d) => {
            const earn = d.deliveryEarnings || 50;
            totalEarnings += earn;
            const delDate = new Date(d.deliveredAt || d.updatedAt);
            if (delDate >= startOfToday) todayEarnings += earn;
            if (delDate >= startOfWeek) weekEarnings += earn;
            if (delDate >= startOfMonth) monthEarnings += earn;
        });

        // Transactions breakdown
        const transactions = await Transaction.find({
            user: req.user._id,
            category: { $in: ["delivery_earning", "tip", "bonus"] }
        }).sort({ createdAt: -1 }).limit(20);

        return res.status(200).json({
            success: true,
            earnings: {
                today: todayEarnings,
                thisWeek: weekEarnings,
                thisMonth: monthEarnings,
                total: totalEarnings,
                breakdown: {
                    deliveryEarnings: totalEarnings,
                    tips: 0,
                    bonuses: 0,
                    incentives: 0
                }
            },
            recentTransactions: transactions
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Delivery Partner Wallet
 * GET /api/delivery-partner/wallet
 */
export const getDeliveryWallet = async (req, res, next) => {
    try {
        const partner = req.deliveryPartner;
        const user = await User.findById(req.user._id);

        const balance = user?.wallet || partner.walletBalance || 0;

        const transactions = await Transaction.find({
            user: req.user._id
        }).sort({ createdAt: -1 }).limit(30);

        return res.status(200).json({
            success: true,
            wallet: {
                availableBalance: balance,
                pendingBalance: 0,
                withdrawableBalance: balance
            },
            transactions
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================================
// 3. ADMIN DELIVERY PARTNERS MANAGEMENT ENDPOINTS
// =========================================================================

/**
 * Get Paginated List of Delivery Partner Applications with KPI metrics
 * GET /api/admin/delivery-partners
 */
export const getAdminDeliveryPartners = async (req, res, next) => {
    try {
        const { status, city, vehicleType, search, page = 1, limit = 20 } = req.query;

        const query = {};

        if (status && status !== "All") {
            query.status = status;
        }

        if (city) {
            query["address.city"] = new RegExp(city.trim(), "i");
        }

        if (vehicleType) {
            query.vehicleType = vehicleType;
        }

        if (search) {
            const regex = new RegExp(search.trim(), "i");
            query.$or = [
                { applicationId: regex },
                { ownerName: regex },
                { email: regex },
                { phone: regex },
                { "address.city": regex }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [applications, totalCount] = await Promise.all([
            DeliveryPartnerApplication.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("deliveryPartnerId", "status availabilityStatus rating totalDeliveries")
                .populate("invitationId", "status expiresAt"),
            DeliveryPartnerApplication.countDocuments(query)
        ]);

        // Aggregate stats
        const [
            totalApplications,
            pendingReview,
            underReview,
            changesRequested,
            approved,
            rejected,
            activePartners,
            suspendedPartners
        ] = await Promise.all([
            DeliveryPartnerApplication.countDocuments(),
            DeliveryPartnerApplication.countDocuments({ status: "pending" }),
            DeliveryPartnerApplication.countDocuments({ status: "under_review" }),
            DeliveryPartnerApplication.countDocuments({ status: "changes_requested" }),
            DeliveryPartnerApplication.countDocuments({ status: "approved" }),
            DeliveryPartnerApplication.countDocuments({ status: "rejected" }),
            DeliveryPartner.countDocuments({ status: "approved" }),
            DeliveryPartner.countDocuments({ status: "suspended" })
        ]);

        return res.status(200).json({
            success: true,
            applications,
            data: applications,
            pagination: {
                total: totalCount,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(totalCount / Number(limit))
            },
            stats: {
                totalApplications,
                totalRequests: totalApplications,
                pending: pendingReview + underReview,
                pendingReview,
                underReview,
                changesRequested,
                approved,
                rejected,
                activePartners,
                suspendedPartners
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Specific Delivery Partner Application by ID
 * GET /api/admin/delivery-partners/:id
 */
export const getAdminDeliveryPartnerById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const application = await DeliveryPartnerApplication.findById(id)
            .populate("deliveryPartnerId")
            .populate("invitationId")
            .populate("reviewedBy", "fullName email");

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Delivery partner application not found."
            });
        }

        let rawInvitationLink = null;
        if (application.invitationId && application.invitationId.status === "pending") {
            // Display active invitation status
        }

        return res.status(200).json({
            success: true,
            application,
            deliveryPartner: application.deliveryPartnerId,
            invitation: application.invitationId
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin Approves Delivery Partner & Generates Secure Single-Use 72h Invitation
 * PUT /api/admin/delivery-partners/:id/approve
 */
export const adminApproveDeliveryPartner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const application = await DeliveryPartnerApplication.findById(id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Delivery partner application not found."
            });
        }

        // 1. Create or Find DeliveryPartner
        let deliveryPartner = null;
        if (application.deliveryPartnerId) {
            deliveryPartner = await DeliveryPartner.findById(application.deliveryPartnerId);
        }

        if (deliveryPartner) {
            deliveryPartner.status = "approved";
            await deliveryPartner.save();
        } else {
            // Find existing user if already registered
            const existingUser = await User.findOne({ email: application.email });

            deliveryPartner = await DeliveryPartner.create({
                userId: existingUser ? existingUser._id : new mongoose.Types.ObjectId(),
                applicationId: application._id,
                name: application.ownerName,
                email: application.email,
                phone: application.phone,
                vehicleType: application.vehicleType,
                vehicleNumber: application.vehicleNumber,
                licenseNumber: application.licenseNumber,
                city: application.address?.city || "Hyderabad",
                state: application.address?.state || "Telangana",
                pincode: application.address?.pincode || "500001",
                status: "approved",
                availabilityStatus: "offline"
            });
        }

        // 2. Generate cryptographically secure invitation token
        const { rawToken, tokenHash } = generateInvitationToken();
        const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

        // Revoke any previous pending invitations
        await DeliveryInvitation.updateMany(
            { applicationId: application._id, status: "pending" },
            { $set: { status: "revoked" } }
        );

        const invitation = await DeliveryInvitation.create({
            applicationId: application._id,
            deliveryPartnerId: deliveryPartner._id,
            email: application.email,
            tokenHash,
            status: "pending",
            expiresAt
        });

        // 3. Update application status
        application.status = "approved";
        application.reviewedBy = req.user._id;
        application.reviewedAt = new Date();
        application.deliveryPartnerId = deliveryPartner._id;
        application.invitationId = invitation._id;
        await application.save();

        const invitationLink = getDeliveryInvitationUrl(rawToken);

        return res.status(200).json({
            success: true,
            message: `Delivery Partner "${application.ownerName}" approved! Secure invitation link generated.`,
            application,
            deliveryPartner,
            invitation: {
                _id: invitation._id,
                email: invitation.email,
                status: invitation.status,
                expiresAt: invitation.expiresAt
            },
            invitationLink
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin Rejects Application
 * PUT /api/admin/delivery-partners/:id/reject
 */
export const adminRejectDeliveryPartner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason || !reason.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide a rejection reason for the applicant."
            });
        }

        const application = await DeliveryPartnerApplication.findById(id);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found."
            });
        }

        application.status = "rejected";
        application.rejectionReason = reason.trim();
        application.reviewedBy = req.user._id;
        application.reviewedAt = new Date();
        await application.save();

        // Invalidate any pending invitations
        await DeliveryInvitation.updateMany(
            { applicationId: application._id, status: "pending" },
            { $set: { status: "revoked" } }
        );

        return res.status(200).json({
            success: true,
            message: `Application ${application.applicationId} marked as Rejected.`,
            application
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin Requests Changes
 * PUT /api/admin/delivery-partners/:id/request-changes
 */
export const adminRequestChangesDeliveryPartner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason || !reason.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please specify what changes or documents are required."
            });
        }

        const application = await DeliveryPartnerApplication.findById(id);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found."
            });
        }

        application.status = "changes_requested";
        application.changesRequestedReason = reason.trim();
        application.reviewedBy = req.user._id;
        application.reviewedAt = new Date();
        await application.save();

        return res.status(200).json({
            success: true,
            message: "Changes requested successfully. The applicant will see this feedback in their tracker.",
            application
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Resend Invitation Token (Revokes previous, generates new 72h token)
 * POST /api/admin/delivery-partners/:id/resend-invitation
 */
export const adminResendDeliveryInvitation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const application = await DeliveryPartnerApplication.findById(id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found."
            });
        }

        if (application.status !== "approved") {
            return res.status(400).json({
                success: false,
                message: "Cannot issue an invitation for an application that is not approved."
            });
        }

        // Revoke older pending invitations
        await DeliveryInvitation.updateMany(
            { applicationId: application._id, status: "pending" },
            { $set: { status: "revoked" } }
        );

        const { rawToken, tokenHash } = generateInvitationToken();
        const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

        const invitation = await DeliveryInvitation.create({
            applicationId: application._id,
            deliveryPartnerId: application.deliveryPartnerId,
            email: application.email,
            tokenHash,
            status: "pending",
            expiresAt
        });

        application.invitationId = invitation._id;
        await application.save();

        const invitationLink = getDeliveryInvitationUrl(rawToken);

        return res.status(200).json({
            success: true,
            message: "New 72-hour invitation link generated successfully.",
            invitation: {
                _id: invitation._id,
                email: invitation.email,
                status: invitation.status,
                expiresAt: invitation.expiresAt
            },
            invitationLink
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Revoke Invitation Token
 * POST /api/admin/delivery-partners/:id/revoke-invitation
 */
export const adminRevokeDeliveryInvitation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const application = await DeliveryPartnerApplication.findById(id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found."
            });
        }

        await DeliveryInvitation.updateMany(
            { applicationId: application._id, status: "pending" },
            { $set: { status: "revoked" } }
        );

        return res.status(200).json({
            success: true,
            message: "Active delivery partner invitations have been revoked."
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Suspend Delivery Partner
 * PUT /api/admin/delivery-partners/:id/suspend
 */
export const adminSuspendDeliveryPartner = async (req, res, next) => {
    try {
        const { id } = req.params;
        let partner = await DeliveryPartner.findById(id);
        let application = null;

        if (!partner) {
            partner = await DeliveryPartner.findOne({ applicationId: id });
            application = await DeliveryPartnerApplication.findById(id);
        } else {
            application = await DeliveryPartnerApplication.findById(partner.applicationId);
        }

        if (!partner && !application) {
            return res.status(404).json({
                success: false,
                message: "Delivery partner not found."
            });
        }

        if (partner) {
            partner.status = "suspended";
            partner.availabilityStatus = "offline";
            await partner.save();
        }

        if (application) {
            application.status = "suspended";
            await application.save();
        }

        return res.status(200).json({
            success: true,
            message: `Delivery partner "${partner?.name || application?.ownerName || "Partner"}" has been suspended.`,
            deliveryPartner: partner,
            application
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Reactivate Delivery Partner
 * PUT /api/admin/delivery-partners/:id/reactivate
 */
export const adminReactivateDeliveryPartner = async (req, res, next) => {
    try {
        const { id } = req.params;
        let partner = await DeliveryPartner.findById(id);
        let application = null;

        if (!partner) {
            partner = await DeliveryPartner.findOne({ applicationId: id });
            application = await DeliveryPartnerApplication.findById(id);
        } else {
            application = await DeliveryPartnerApplication.findById(partner.applicationId);
        }

        if (!partner && !application) {
            return res.status(404).json({
                success: false,
                message: "Delivery partner not found."
            });
        }

        if (partner) {
            partner.status = "approved";
            await partner.save();
        }

        if (application) {
            application.status = "approved";
            await application.save();
        }

        return res.status(200).json({
            success: true,
            message: `Delivery partner "${partner?.name || application?.ownerName || "Partner"}" has been reactivated.`,
            deliveryPartner: partner,
            application
        });
    } catch (error) {
        next(error);
    }
};
