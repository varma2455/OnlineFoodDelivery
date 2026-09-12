import express from "express";
import {
  getSupportOverview,
  getFAQs,
  createTicket,
  getUserTickets,
  getTicketDetails,
  replyToTicket,
  submitTicketFeedback,
  cancelOrderThroughSupport
} from "../controllers/supportController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/overview", optionalAuth, getSupportOverview);
router.get("/faqs", getFAQs);
router.post("/tickets", protect, upload.single("attachment"), createTicket);
router.get("/tickets", protect, getUserTickets);
router.get("/tickets/:id", protect, getTicketDetails);
router.post("/tickets/:id/messages", protect, upload.single("attachment"), replyToTicket);
router.post("/tickets/:id/feedback", protect, submitTicketFeedback);
router.post("/orders/:orderId/cancel", protect, cancelOrderThroughSupport);

export default router;
