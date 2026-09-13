import express from "express";
import {
    getAdminDashboard,
    getAdminFoods,
    getAdminOrders,
    updateAdminOrderStatus,
    assignDeliveryPartnerToOrder,
    autoAssignDeliveryPartner,
    getEligibleDeliveryDrivers,
    deleteAdminOrder,
    getAdminUsers,
    toggleBlockUser,
    changeUserRole,
    deleteUser,
    getFirebaseUsers,
    getAdminRestaurants,
    getAdminRestaurantById,
    approveRestaurant,
    rejectRestaurant,
    suspendRestaurant,
    activateRestaurant
} from "../controllers/adminController.js";
import {
    getAdminPartnerApplications,
    getAdminPartnerApplicationById,
    adminCreatePartnerApplication,
    adminApprovePartnerApplication,
    adminRejectPartnerApplication,
    adminRequestChangesPartnerApplication,
    adminResendPartnerInvitation,
    adminRevokePartnerInvitation
} from "../controllers/restaurantPartnerController.js";
import {
    getAdminDeliveryPartners,
    getAdminDeliveryPartnerById,
    adminApproveDeliveryPartner,
    adminRejectDeliveryPartner,
    adminRequestChangesDeliveryPartner,
    adminResendDeliveryInvitation,
    adminRevokeDeliveryInvitation,
    adminSuspendDeliveryPartner,
    adminReactivateDeliveryPartner
} from "../controllers/deliveryPartnerController.js";
import { addFood, updateFood, deleteFood } from "../controllers/foodController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, isAdmin);

// Dashboard & Stats
router.get(["/dashboard", "/stats"], getAdminDashboard);

// Restaurants Management
router.get("/restaurants", getAdminRestaurants);
router.get("/restaurants/:id", getAdminRestaurantById);
router.put("/restaurants/:id/approve", approveRestaurant);
router.put("/restaurants/:id/reject", rejectRestaurant);
router.put("/restaurants/:id/suspend", suspendRestaurant);
router.put("/restaurants/:id/activate", activateRestaurant);

// Restaurant Partner Partnership Applications & Invitations
router.get("/restaurant-partners", getAdminPartnerApplications);
router.get("/restaurant-partners/:id", getAdminPartnerApplicationById);
router.post("/restaurant-partners", adminCreatePartnerApplication);
router.put("/restaurant-partners/:id/approve", adminApprovePartnerApplication);
router.put("/restaurant-partners/:id/reject", adminRejectPartnerApplication);
router.put("/restaurant-partners/:id/request-changes", adminRequestChangesPartnerApplication);
router.post("/restaurant-partners/:id/invitation", adminResendPartnerInvitation);
router.post("/restaurant-partners/:id/resend-invitation", adminResendPartnerInvitation);
router.post("/restaurant-partners/:id/revoke-invitation", adminRevokePartnerInvitation);

// Delivery Partners Management & Invitations
router.get("/delivery-partners", getAdminDeliveryPartners);
router.get("/delivery-partners/:id", getAdminDeliveryPartnerById);
router.put("/delivery-partners/:id/approve", adminApproveDeliveryPartner);
router.post("/delivery-partners/:id/approve", adminApproveDeliveryPartner);
router.put("/delivery-partners/:id/reject", adminRejectDeliveryPartner);
router.post("/delivery-partners/:id/reject", adminRejectDeliveryPartner);
router.put("/delivery-partners/:id/request-changes", adminRequestChangesDeliveryPartner);
router.post("/delivery-partners/:id/request-changes", adminRequestChangesDeliveryPartner);
router.post("/delivery-partners/:id/resend-invitation", adminResendDeliveryInvitation);
router.put("/delivery-partners/:id/resend-invitation", adminResendDeliveryInvitation);
router.post("/delivery-partners/:id/revoke-invitation", adminRevokeDeliveryInvitation);
router.put("/delivery-partners/:id/revoke-invitation", adminRevokeDeliveryInvitation);
router.put("/delivery-partners/:id/suspend", adminSuspendDeliveryPartner);
router.post("/delivery-partners/:id/suspend", adminSuspendDeliveryPartner);
router.put("/delivery-partners/:id/reactivate", adminReactivateDeliveryPartner);
router.post("/delivery-partners/:id/reactivate", adminReactivateDeliveryPartner);

// Foods
router.get("/foods", getAdminFoods);
router.post("/foods", upload.single("image"), addFood);
router.put("/foods/:id", upload.single("image"), updateFood);
router.delete("/foods/:id", deleteFood);

// Orders
router.get("/orders", getAdminOrders);
router.get("/orders/eligible-drivers", getEligibleDeliveryDrivers);
router.get("/delivery-partners/eligible-for-assignment", getEligibleDeliveryDrivers);
router.put("/orders/:id/status", updateAdminOrderStatus);
router.put("/orders/:id/assign-delivery", assignDeliveryPartnerToOrder);
router.post("/orders/:id/assign-delivery", assignDeliveryPartnerToOrder);
router.post("/orders/:id/auto-assign", autoAssignDeliveryPartner);
router.delete("/orders/:id", deleteAdminOrder);

// Users (MongoDB & Roles)
router.get("/users", getAdminUsers);
router.put("/users/:id/block", toggleBlockUser);
router.put("/users/:id/unblock", toggleBlockUser);
router.put("/users/:id/role", changeUserRole);
router.delete("/users/:id", deleteUser);

// Firebase Management (Admin Only)
router.get("/firebase/users", getFirebaseUsers);

export default router;
