import RestaurantPartnerApplication from "../models/RestaurantPartnerApplication.js";
import RestaurantInvitation from "../models/RestaurantInvitation.js";
import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js";
import { generateInvitationToken, hashToken, getInvitationUrl, generateApplicationId } from "../utils/invitationUtils.js";
import { verifyFirebaseToken } from "../config/firebaseAdmin.js";
import jwt from "jsonwebtoken";
import axios from "axios";

const FIREBASE_API_KEY =
    process.env.FIREBASE_WEB_API_KEY ||
    process.env.REACT_APP_FIREBASE_API_KEY ||
    "AIzaSyB63dXav-PnSWkqlbrjpyrWllCbCkEl1uM";

const generateJwtToken = (userId, role = "restaurant") => {
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET || "foodexpress_secret_jwt_key_2025",
        { expiresIn: "7d" }
    );
};

// =========================================================================
// PUBLIC & RESTAURANT PARTNER APPLICANT ENDPOINTS
// =========================================================================

/**
 * Submit a new Restaurant Partnership Request
 * POST /api/restaurant-partner/apply
 */
export const applyForPartnership = async (req, res, next) => {
    try {
        const {
            ownerName,
            email,
            phone,
            restaurantName,
            description,
            cuisineTypes,
            restaurantType,
            address,
            businessEmail,
            openingTime,
            closingTime,
            minimumOrderAmount,
            deliveryFee,
            gstNumber,
            fssaiNumber,
            businessRegistrationNumber
        } = req.body;

        if (!ownerName || !email || !phone || !restaurantName) {
            return res.status(400).json({
                success: false,
                message: "Owner name, email, phone number, and restaurant name are required."
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if there is already an active pending application
        const existingApp = await RestaurantPartnerApplication.findOne({
            email: normalizedEmail,
            status: { $in: ["pending", "changes_requested"] }
        });

        if (existingApp) {
            return res.status(200).json({
                success: true,
                message: "You already have a pending partnership application under review.",
                alreadySubmitted: true,
                application: existingApp
            });
        }

        // Generate unique Application ID
        let applicationId = generateApplicationId();
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 5) {
            const collision = await RestaurantPartnerApplication.findOne({ applicationId });
            if (!collision) {
                isUnique = true;
            } else {
                applicationId = generateApplicationId();
                attempts++;
            }
        }

        const application = await RestaurantPartnerApplication.create({
            applicationId,
            ownerName: ownerName.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            restaurantName: restaurantName.trim(),
            description: description ? description.trim() : "",
            cuisineTypes: Array.isArray(cuisineTypes) && cuisineTypes.length > 0 ? cuisineTypes : ["Indian"],
            restaurantType: restaurantType || "Both",
            address: {
                street: address?.street ? address.street.trim() : "",
                city: address?.city ? address.city.trim() : "Hyderabad",
                state: address?.state ? address.state.trim() : "Telangana",
                pincode: address?.pincode ? address.pincode.trim() : "500001"
            },
            businessEmail: businessEmail ? businessEmail.toLowerCase().trim() : normalizedEmail,
            openingTime: openingTime || "09:00 AM",
            closingTime: closingTime || "11:00 PM",
            minimumOrderAmount: minimumOrderAmount !== undefined ? Number(minimumOrderAmount) : 100,
            deliveryFee: deliveryFee !== undefined ? Number(deliveryFee) : 40,
            gstNumber: gstNumber ? gstNumber.trim() : "",
            fssaiNumber: fssaiNumber ? fssaiNumber.trim() : "",
            businessRegistrationNumber: businessRegistrationNumber ? businessRegistrationNumber.trim() : "",
            status: "pending"
        });

        return res.status(201).json({
            success: true,
            message: "Restaurant partnership request submitted successfully! Our team will review your application.",
            application
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Check Partnership Application Status
 * GET /api/restaurant-partner/application-status
 */
export const getApplicationStatus = async (req, res, next) => {
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

        const application = await RestaurantPartnerApplication.findOne(query)
            .sort({ createdAt: -1 })
            .populate("restaurantId", "name status isActive address rating")
            .populate("invitationId", "status expiresAt");

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "No partnership application found for the provided details."
            });
        }

        // Timeline steps
        const status = application.status;
        const invitation = application.invitationId;
        const timeline = [
            { key: "submitted", title: "Application Submitted", status: "completed", date: application.createdAt },
            {
                key: "review",
                title: "Admin Verification",
                status: status === "pending" ? "current" : status === "changes_requested" ? "warning" : "completed",
                reason: status === "changes_requested" ? application.changesRequestedReason : null
            },
            {
                key: "approved",
                title: status === "rejected" ? "Application Rejected" : "Approved",
                status: status === "approved" ? "completed" : status === "rejected" ? "failed" : "pending",
                reason: status === "rejected" ? application.rejectionReason : null
            },
            {
                key: "invitation",
                title: "Partner Invitation",
                status: invitation ? (invitation.status === "used" ? "completed" : "current") : "pending"
            },
            {
                key: "activated",
                title: "Account Activated",
                status: invitation && invitation.status === "used" ? "completed" : "pending"
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
                restaurantName: application.restaurantName,
                description: application.description,
                cuisineTypes: application.cuisineTypes,
                restaurantType: application.restaurantType,
                address: application.address,
                status: application.status,
                rejectionReason: application.rejectionReason,
                changesRequestedReason: application.changesRequestedReason,
                createdAt: application.createdAt,
                updatedAt: application.updatedAt,
                restaurant: application.restaurantId,
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
 * GET /api/restaurant-partner/invitation/:token
 */
export const getInvitationByToken = async (req, res, next) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Invitation token is required."
            });
        }

        const tokenHash = hashToken(token);
        const invitation = await RestaurantInvitation.findOne({ tokenHash })
            .populate("applicationId")
            .populate("restaurantId");

        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: "Invalid or nonexistent invitation link. Please check your link or contact support."
            });
        }

        if (invitation.status === "revoked") {
            return res.status(400).json({
                success: false,
                status: "revoked",
                message: "This invitation has been revoked by the administrator."
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
                message: "This invitation has expired. Please contact the administrator to resend an invitation."
            });
        }

        const app = invitation.applicationId;
        const rest = invitation.restaurantId;

        return res.status(200).json({
            success: true,
            invitation: {
                email: invitation.email,
                expiresAt: invitation.expiresAt,
                ownerName: app ? app.ownerName : "Restaurant Partner",
                restaurantName: rest ? rest.name : (app ? app.restaurantName : "Your Restaurant"),
                city: rest ? rest.address?.city : (app ? app.address?.city : "Hyderabad")
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Activate Restaurant Partner Account
 * POST /api/restaurant-partner/activate
 */
export const activatePartnerAccount = async (req, res, next) => {
    try {
        const { token, idToken, password, fullName, phone } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Invitation token is required."
            });
        }

        const tokenHash = hashToken(token);
        const invitation = await RestaurantInvitation.findOne({ tokenHash })
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

        // 1. If Firebase ID Token was provided from frontend Firebase sign-up / sign-in
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

            // Security requirement: Ensure email matches the invitation
            if (verifiedEmail && verifiedEmail !== targetEmail) {
                return res.status(403).json({
                    success: false,
                    message: `This invitation was issued to "${targetEmail}", but the signed-in account is "${verifiedEmail}". Please activate with the correct email address.`
                });
            }
        } else if (password) {
            // 2. Direct password activation: create or authenticate in Firebase Auth via REST API
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
                    // Sign in with existing credentials
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
                            message: "A Firebase user with this email already exists. Please enter the correct password."
                        });
                    }
                } else {
                    console.warn("Firebase Auth setup note:", errCode || signUpErr.message);
                }
            }
        }

        const app = invitation.applicationId;
        const finalName = (fullName || (app ? app.ownerName : "Restaurant Partner")).trim();
        const finalPhone = (phone || (app ? app.phone : "")).trim();

        // 3. Find or Create/Update User in MongoDB
        let user = await User.findOne({ email: targetEmail });

        if (user) {
            user.role = "restaurant";
            user.isVerified = true;
            user.isActive = true;
            if (firebaseUid) user.firebaseUid = firebaseUid;
            if (password) user.password = password; // Schema hashes with bcrypt
            if (finalName) user.fullName = finalName;
            if (finalPhone) user.phone = finalPhone;
            await user.save();
        } else {
            user = await User.create({
                fullName: finalName,
                email: targetEmail,
                phone: finalPhone,
                role: "restaurant",
                isVerified: true,
                isActive: true,
                firebaseUid: firebaseUid || undefined,
                password: password || "PartnerPassword123!"
            });
        }

        // 4. Find or Create/Update Restaurant in MongoDB
        let restaurant = null;

        if (invitation.restaurantId) {
            restaurant = await Restaurant.findById(invitation.restaurantId);
        }

        if (!restaurant && app) {
            restaurant = await Restaurant.findOne({ email: app.businessEmail || targetEmail });
        }

        if (restaurant) {
            restaurant.ownerId = user._id;
            restaurant.status = "approved";
            restaurant.isActive = true;
            restaurant.isOpen = true;
            await restaurant.save();
        } else if (app) {
            restaurant = await Restaurant.create({
                ownerId: user._id,
                name: app.restaurantName,
                description: app.description || "Authentic culinary specialties prepared with passion.",
                email: app.businessEmail || targetEmail,
                phone: app.phone,
                cuisineTypes: app.cuisineTypes || ["Indian"],
                restaurantType: app.restaurantType || "Both",
                address: app.address,
                openingTime: app.openingTime || "09:00 AM",
                closingTime: app.closingTime || "11:00 PM",
                minimumOrderAmount: app.minimumOrderAmount || 100,
                deliveryFee: app.deliveryFee || 40,
                status: "approved",
                isActive: true,
                isOpen: true
            });
        }

        // 5. Update Application and Invitation Status
        if (app) {
            app.status = "approved";
            if (restaurant) app.restaurantId = restaurant._id;
            await app.save();
        }

        invitation.status = "used";
        invitation.usedAt = new Date();
        if (restaurant) invitation.restaurantId = restaurant._id;
        await invitation.save();

        // 6. Generate authenticated session token
        const jwtToken = generateJwtToken(user._id, "restaurant");

        return res.status(200).json({
            success: true,
            message: "Your FoodExpress Restaurant Partner account has been activated successfully! 🚀",
            token: jwtToken,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                phone: user.phone
            },
            restaurant: restaurant ? {
                _id: restaurant._id,
                name: restaurant.name,
                status: restaurant.status,
                isActive: restaurant.isActive
            } : null
        });
    } catch (error) {
        next(error);
    }
};

// =========================================================================
// ADMIN CONTROLLED RESTAURANT PARTNERS ENDPOINTS
// =========================================================================

/**
 * List Restaurant Partner Applications & Real Telemetry Stats
 * GET /api/admin/restaurant-partners
 */
export const getAdminPartnerApplications = async (req, res, next) => {
    try {
        const { status, search, city } = req.query;
        let query = {};

        if (status && status !== "All" && status !== "all") {
            query.status = status.toLowerCase().trim();
        }

        if (search) {
            const regex = new RegExp(search.trim(), "i");
            query.$or = [
                { applicationId: regex },
                { ownerName: regex },
                { restaurantName: regex },
                { email: regex },
                { phone: regex }
            ];
        }

        if (city && city !== "All" && city !== "all") {
            query["address.city"] = new RegExp(`^${city.trim()}$`, "i");
        }

        const applications = await RestaurantPartnerApplication.find(query)
            .sort({ createdAt: -1 })
            .populate("restaurantId", "name status isActive")
            .populate("invitationId", "status expiresAt");

        // Aggregated Real MongoDB Stats
        const totalRequests = await RestaurantPartnerApplication.countDocuments({});
        const pendingCount = await RestaurantPartnerApplication.countDocuments({ status: "pending" });
        const approvedCount = await RestaurantPartnerApplication.countDocuments({ status: "approved" });
        const rejectedCount = await RestaurantPartnerApplication.countDocuments({ status: "rejected" });
        const changesRequestedCount = await RestaurantPartnerApplication.countDocuments({ status: "changes_requested" });
        const activePartnersCount = await Restaurant.countDocuments({ status: "approved", isActive: true });

        return res.status(200).json({
            success: true,
            total: applications.length,
            stats: {
                totalRequests,
                pending: pendingCount,
                approved: approvedCount,
                rejected: rejectedCount,
                changesRequested: changesRequestedCount,
                activePartners: activePartnersCount
            },
            applications
        });
    } catch (error) {
        next(error);
    }
};

/**
 * View Single Restaurant Partner Application in Detail
 * GET /api/admin/restaurant-partners/:id
 */
export const getAdminPartnerApplicationById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const application = await RestaurantPartnerApplication.findById(id)
            .populate("reviewedBy", "fullName email")
            .populate("restaurantId")
            .populate("invitationId");

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Restaurant partner application not found."
            });
        }

        let invitationDetails = null;
        if (application.invitationId) {
            invitationDetails = {
                _id: application.invitationId._id,
                status: application.invitationId.status,
                expiresAt: application.invitationId.expiresAt,
                usedAt: application.invitationId.usedAt,
                isExpired: application.invitationId.expiresAt < new Date()
            };
        }

        return res.status(200).json({
            success: true,
            application,
            invitation: invitationDetails
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin Create Restaurant Partner Application Directly (Offline Onboarding)
 * POST /api/admin/restaurant-partners
 */
export const adminCreatePartnerApplication = async (req, res, next) => {
    try {
        const {
            ownerName,
            email,
            phone,
            restaurantName,
            description,
            cuisineTypes,
            restaurantType,
            address,
            autoApprove
        } = req.body;

        if (!ownerName || !email || !phone || !restaurantName) {
            return res.status(400).json({
                success: false,
                message: "Owner name, email, phone, and restaurant name are required."
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const applicationId = generateApplicationId();

        const application = await RestaurantPartnerApplication.create({
            applicationId,
            ownerName: ownerName.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            restaurantName: restaurantName.trim(),
            description: description ? description.trim() : "",
            cuisineTypes: Array.isArray(cuisineTypes) && cuisineTypes.length > 0 ? cuisineTypes : ["Indian"],
            restaurantType: restaurantType || "Both",
            address: {
                street: address?.street ? address.street.trim() : "",
                city: address?.city ? address.city.trim() : "Hyderabad",
                state: address?.state ? address.state.trim() : "Telangana",
                pincode: address?.pincode ? address.pincode.trim() : "500001"
            },
            status: autoApprove ? "approved" : "pending",
            reviewedBy: autoApprove ? req.user._id : undefined,
            reviewedAt: autoApprove ? new Date() : undefined
        });

        let invitationLink = null;
        let restaurant = null;

        if (autoApprove) {
            // Create Restaurant record in MongoDB
            restaurant = await Restaurant.create({
                name: application.restaurantName,
                description: application.description || "Authentic quality dining.",
                email: application.email,
                phone: application.phone,
                cuisineTypes: application.cuisineTypes,
                restaurantType: application.restaurantType,
                address: application.address,
                status: "approved",
                isActive: true,
                isOpen: true
            });

            // Generate secure invitation
            const { rawToken, tokenHash } = generateInvitationToken();
            const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

            const invitation = await RestaurantInvitation.create({
                applicationId: application._id,
                restaurantId: restaurant._id,
                email: normalizedEmail,
                tokenHash,
                status: "pending",
                expiresAt
            });

            application.restaurantId = restaurant._id;
            application.invitationId = invitation._id;
            await application.save();

            invitationLink = getInvitationUrl(rawToken);
        }

        return res.status(201).json({
            success: true,
            message: autoApprove
                ? "Restaurant Partner created and approved! An invitation link has been generated."
                : "Restaurant Partner application created as Pending.",
            application,
            restaurant,
            invitationLink
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin Approves Application -> Generates Secure Single-Use Invitation
 * PUT /api/admin/restaurant-partners/:id/approve
 */
export const adminApprovePartnerApplication = async (req, res, next) => {
    try {
        const { id } = req.params;
        const application = await RestaurantPartnerApplication.findById(id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found."
            });
        }

        // 1. Create or ensure Restaurant record exists
        let restaurant = null;
        if (application.restaurantId) {
            restaurant = await Restaurant.findById(application.restaurantId);
        }

        if (!restaurant) {
            restaurant = await Restaurant.findOne({ email: application.businessEmail || application.email });
        }

        if (restaurant) {
            restaurant.status = "approved";
            restaurant.isActive = true;
            restaurant.isOpen = true;
            await restaurant.save();
        } else {
            restaurant = await Restaurant.create({
                name: application.restaurantName,
                description: application.description || "Quality food and express service.",
                email: application.businessEmail || application.email,
                phone: application.phone,
                cuisineTypes: application.cuisineTypes,
                restaurantType: application.restaurantType,
                address: application.address,
                openingTime: application.openingTime,
                closingTime: application.closingTime,
                minimumOrderAmount: application.minimumOrderAmount,
                deliveryFee: application.deliveryFee,
                status: "approved",
                isActive: true,
                isOpen: true
            });
        }

        // 2. Generate cryptographically secure invitation token
        const { rawToken, tokenHash } = generateInvitationToken();
        const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours validity

        // Revoke any previous pending invitations for this application
        await RestaurantInvitation.updateMany(
            { applicationId: application._id, status: "pending" },
            { $set: { status: "revoked" } }
        );

        const invitation = await RestaurantInvitation.create({
            applicationId: application._id,
            restaurantId: restaurant._id,
            email: application.email,
            tokenHash,
            status: "pending",
            expiresAt
        });

        // 3. Update application status
        application.status = "approved";
        application.reviewedBy = req.user._id;
        application.reviewedAt = new Date();
        application.restaurantId = restaurant._id;
        application.invitationId = invitation._id;
        await application.save();

        const invitationLink = getInvitationUrl(rawToken);

        return res.status(200).json({
            success: true,
            message: `Partner "${application.restaurantName}" approved! Secure invitation link generated.`,
            application,
            restaurant,
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
 * PUT /api/admin/restaurant-partners/:id/reject
 */
export const adminRejectPartnerApplication = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const application = await RestaurantPartnerApplication.findById(id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found."
            });
        }

        const rejectionReason = (reason || "Application does not meet FoodExpress quality standards.").trim();

        application.status = "rejected";
        application.rejectionReason = rejectionReason;
        application.reviewedBy = req.user._id;
        application.reviewedAt = new Date();
        await application.save();

        // Revoke any pending invitations
        await RestaurantInvitation.updateMany(
            { applicationId: application._id, status: "pending" },
            { $set: { status: "revoked" } }
        );

        // Update restaurant status if already created
        if (application.restaurantId) {
            await Restaurant.findByIdAndUpdate(application.restaurantId, {
                status: "rejected",
                rejectionReason,
                isActive: false
            });
        }

        return res.status(200).json({
            success: true,
            message: `Application for "${application.restaurantName}" has been rejected.`,
            application
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin Requests Changes from Applicant
 * PUT /api/admin/restaurant-partners/:id/request-changes
 */
export const adminRequestChangesPartnerApplication = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const application = await RestaurantPartnerApplication.findById(id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found."
            });
        }

        application.status = "changes_requested";
        application.changesRequestedReason = (reason || "Additional documentation or details required.").trim();
        application.reviewedBy = req.user._id;
        application.reviewedAt = new Date();
        await application.save();

        return res.status(200).json({
            success: true,
            message: `Requested changes from "${application.restaurantName}".`,
            application
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin Generates / Resends a Fresh Partner Invitation
 * POST /api/admin/restaurant-partners/:id/resend-invitation
 */
export const adminResendPartnerInvitation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const application = await RestaurantPartnerApplication.findById(id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found."
            });
        }

        if (application.status !== "approved") {
            return res.status(400).json({
                success: false,
                message: "Can only send invitations to approved applications."
            });
        }

        // Revoke all prior pending invitations
        await RestaurantInvitation.updateMany(
            { applicationId: application._id, status: "pending" },
            { $set: { status: "revoked" } }
        );

        // Generate fresh invitation token
        const { rawToken, tokenHash } = generateInvitationToken();
        const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

        const invitation = await RestaurantInvitation.create({
            applicationId: application._id,
            restaurantId: application.restaurantId,
            email: application.email,
            tokenHash,
            status: "pending",
            expiresAt
        });

        application.invitationId = invitation._id;
        await application.save();

        const invitationLink = getInvitationUrl(rawToken);

        return res.status(200).json({
            success: true,
            message: "New invitation link generated successfully!",
            invitationLink,
            invitation: {
                _id: invitation._id,
                email: invitation.email,
                status: invitation.status,
                expiresAt: invitation.expiresAt
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin Revokes Pending Invitation
 * POST /api/admin/restaurant-partners/:id/revoke-invitation
 */
export const adminRevokePartnerInvitation = async (req, res, next) => {
    try {
        const { id } = req.params;

        await RestaurantInvitation.updateMany(
            { applicationId: id, status: "pending" },
            { $set: { status: "revoked" } }
        );

        return res.status(200).json({
            success: true,
            message: "Pending invitations have been revoked."
        });
    } catch (error) {
        next(error);
    }
};
