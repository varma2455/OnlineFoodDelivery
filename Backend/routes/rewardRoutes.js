import express from "express";
import {
  getRewardProfile,
  getRewardCatalog,
  redeemReward,
  getRedeemedRewards,
  getRewardHistory
} from "../controllers/rewardController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getRewardProfile);
router.get("/catalog", optionalAuth, getRewardCatalog);
router.post("/:id/redeem", protect, redeemReward);
router.get("/redeemed", protect, getRedeemedRewards);
router.get("/history", protect, getRewardHistory);

export default router;
