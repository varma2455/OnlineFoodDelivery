import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getNavbar,
  getDashboardStats,
  getWallet,
  getRecentOrders,
  getOffers,
  getPopularFoods
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/navbar", protect, getNavbar);
router.get("/stats", protect, getDashboardStats);
router.get("/wallet", protect, getWallet);
router.get("/orders", protect, getRecentOrders);
router.get("/offers", protect, getOffers);
router.get("/popular-foods", protect, getPopularFoods);

export default router;