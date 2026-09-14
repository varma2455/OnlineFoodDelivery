import express from "express";
import {
    applyForDeliveryPartnership,
    getDeliveryApplicationStatus,
    getDeliveryInvitationByToken,
    activateDeliveryPartnerAccount,
    getMyDeliveryProfile,
    updateDeliveryProfile,
    getDeliveryDashboard,
    updateAvailability,
    updateLocation,
    getAvailableOrders,
    getOrderDetails,
    acceptOrder,
    updateDeliveryOrderStatus,
    verifyDeliveryOtp,
    getMyDeliveries,
    getDeliveryEarnings,
    getDeliveryWallet
} from "../controllers/deliveryPartnerController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";
import { requireDeliveryPartner } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ==========================================
// Public Applicant & Invitation Endpoints
// ==========================================
router.post("/apply", applyForDeliveryPartnership);
router.get("/application-status", optionalAuth, getDeliveryApplicationStatus);
router.get("/invitation/:token", getDeliveryInvitationByToken);
router.post("/activate", activateDeliveryPartnerAccount);

// ==========================================
// Authenticated Delivery Partner Portal Endpoints
// ==========================================
router.get("/me", protect, requireDeliveryPartner({ requireApproved: false }), getMyDeliveryProfile);
router.get("/profile", protect, requireDeliveryPartner({ requireApproved: false }), getMyDeliveryProfile);
router.put("/profile", protect, requireDeliveryPartner({ requireApproved: true }), updateDeliveryProfile);
router.get("/dashboard", protect, requireDeliveryPartner({ requireApproved: true }), getDeliveryDashboard);
router.put("/availability", protect, requireDeliveryPartner({ requireApproved: true }), updateAvailability);
router.put("/location", protect, requireDeliveryPartner({ requireApproved: true }), updateLocation);
router.get("/orders", protect, requireDeliveryPartner({ requireApproved: true }), getAvailableOrders);
router.get("/orders/:id", protect, requireDeliveryPartner({ requireApproved: true }), getOrderDetails);
router.post("/orders/:id/accept", protect, requireDeliveryPartner({ requireApproved: true }), acceptOrder);
router.put("/orders/:id/status", protect, requireDeliveryPartner({ requireApproved: true }), updateDeliveryOrderStatus);
router.post("/orders/:id/verify-otp", protect, requireDeliveryPartner({ requireApproved: true }), verifyDeliveryOtp);
router.get("/my-deliveries", protect, requireDeliveryPartner({ requireApproved: true }), getMyDeliveries);
router.get("/earnings", protect, requireDeliveryPartner({ requireApproved: true }), getDeliveryEarnings);
router.get("/wallet", protect, requireDeliveryPartner({ requireApproved: true }), getDeliveryWallet);

export default router;
