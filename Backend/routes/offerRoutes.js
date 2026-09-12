import express from "express";
import {
  getOffers,
  getOfferDetails,
  validateOffer,
  toggleSaveOffer,
  createOffer,
  updateOffer,
  deleteOffer
} from "../controllers/offerController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public & Personalized Offers (optional auth for personalization)
router.get("/", optionalAuth, getOffers);
router.post("/validate", optionalAuth, validateOffer);
router.get("/:codeOrId", optionalAuth, getOfferDetails);

// Bookmark / Save offer (authenticated)
router.post("/:id/save", protect, toggleSaveOffer);

// Admin Offer Management
router.post("/", protect, isAdmin, createOffer);
router.put("/:id", protect, isAdmin, updateOffer);
router.delete("/:id", protect, isAdmin, deleteOffer);

export default router;
