import express from "express";
import {
    getMembershipStatus,
    subscribeMembership,
    toggleAutoRenew,
    cancelMembership,
    getMembershipHistory,
    getAllMemberships
} from "../controllers/membershipController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/status", protect, getMembershipStatus);
router.post("/subscribe", protect, subscribeMembership);
router.put("/auto-renew", protect, toggleAutoRenew);
router.put("/cancel", protect, cancelMembership);
router.get("/history", protect, getMembershipHistory);
router.get("/admin/all", protect, isAdmin, getAllMemberships);

export default router;
