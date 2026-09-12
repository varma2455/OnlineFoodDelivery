import express from "express";
import {
  addMoney,
  getWalletDetails,
  getTransactions
} from "../controllers/walletController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add-money", protect, addMoney);
router.get("/details", protect, getWalletDetails);
router.get("/transactions", protect, getTransactions);

export default router;
