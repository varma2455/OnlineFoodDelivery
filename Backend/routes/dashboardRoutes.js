import express from "express";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";
import {
  getNavbar,
  getDashboardStats,
  getWallet,
  getRecentOrders,
  getOffers,
  getPopularFoods,
  getActiveOrder,
  getRecommendations,
  getTopRestaurants
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/navbar", protect, getNavbar);
router.get("/stats", protect, getDashboardStats);
router.get("/wallet", protect, getWallet);
router.get("/orders", protect, getRecentOrders);
router.get("/offers", optionalAuth, getOffers);
router.get("/popular-foods", optionalAuth, getPopularFoods);
router.get("/active-order", protect, getActiveOrder);
router.get("/recommendations", optionalAuth, getRecommendations);
router.get("/restaurants", optionalAuth, getTopRestaurants);

export default router;