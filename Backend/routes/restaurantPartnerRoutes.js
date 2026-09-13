import express from "express";
import {
    applyForPartnership,
    getApplicationStatus,
    getInvitationByToken,
    activatePartnerAccount
} from "../controllers/restaurantPartnerController.js";
import { optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public / Applicant routes
router.post("/apply", applyForPartnership);
router.get("/application-status", optionalAuth, getApplicationStatus);
router.get("/invitation/:token", getInvitationByToken);
router.post("/activate", activatePartnerAccount);

export default router;
