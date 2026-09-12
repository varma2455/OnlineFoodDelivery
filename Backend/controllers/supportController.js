import SupportTicket from "../models/SupportTicket.js";
import SupportFAQ from "../models/SupportFAQ.js";
import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";
import Food from "../models/Food.js";

/**
 * GET /api/support/overview
 * Get personalized support overview (recent orders, open tickets, refunds, hours)
 */
export const getSupportOverview = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;

    let recentOrders = [];
    let userTickets = [];
    let openTicketsCount = 0;
    let recentRefunds = [];

    if (userId) {
      // 1. Fetch user recent 5 orders for Quick Order Help
      recentOrders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("_id orderStatus paymentMethod paymentStatus totalAmount finalAmount items createdAt deliveredAt");

      // 2. Fetch user tickets
      userTickets = await SupportTicket.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5);

      openTicketsCount = await SupportTicket.countDocuments({
        user: userId,
        status: { $in: ["Open", "In Progress", "Waiting for User"] }
      });

      // 3. Fetch real refunds from Transactions or cancelled orders
      const refundTxs = await Transaction.find({
        user: userId,
        $or: [{ category: "refund" }, { category: "cashback" }]
      }).sort({ createdAt: -1 }).limit(3);

      recentRefunds = refundTxs.map((t) => ({
        id: `RF-${t._id.toString().slice(-4).toUpperCase()}`,
        amount: t.amount,
        status: t.status === "Success" ? "Completed" : "Processing",
        date: t.createdAt,
        description: t.description || "Order Refund"
      }));

      // Check if user has cancelled orders without refund transaction
      if (recentRefunds.length === 0) {
        const cancelled = recentOrders.filter((o) => o.orderStatus === "Cancelled");
        if (cancelled.length > 0) {
          recentRefunds = cancelled.map((c) => ({
            id: `RF-${c._id.toString().slice(-4).toUpperCase()}`,
            amount: c.finalAmount || c.totalAmount,
            status: "Processed",
            date: c.createdAt,
            description: `Refund for Order #${c._id.toString().slice(-6).toUpperCase()}`
          }));
        }
      }
    }

    const categories = [
      { id: "Orders", label: "Orders", icon: "🍔", description: "Missing items, food quality, or order changes" },
      { id: "Delivery", label: "Delivery", icon: "🚚", description: "Track order, delivery delays, or driver contact" },
      { id: "Payments", label: "Payments", icon: "💳", description: "Failed payment, charges, or payment methods" },
      { id: "Refunds", label: "Refunds", icon: "💰", description: "Refund timelines, bank delays, or wallet credit" },
      { id: "Wallet", label: "Wallet", icon: "👛", description: "Balance discrepancy, top-up, or cashbacks" },
      { id: "Rewards", label: "Rewards", icon: "⭐", description: "Reward points, vouchers, or tier benefits" },
      { id: "Account", label: "Account", icon: "👤", description: "Address management, login, or security" },
      { id: "Restaurant", label: "Restaurant", icon: "🏪", description: "Hygiene, food temperature, or packaging" }
    ];

    const supportHours = {
      days: "Monday – Sunday",
      hours: "9:00 AM – 11:00 PM IST",
      status: "Available Now",
      email: "care@foodexpress.in",
      phone: "+91 1800 200 4567"
    };

    return res.status(200).json({
      success: true,
      categories,
      supportHours,
      recentOrders,
      userTickets,
      openTicketsCount,
      recentRefunds
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/support/faqs
 * Search & filter FAQs
 */
export const getFAQs = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = { isActive: true };

    if (category && category !== "All") {
      query.category = category;
    }

    if (search && search.trim()) {
      const q = search.trim();
      const regex = new RegExp(q, "i");
      query.$or = [
        { question: regex },
        { answer: regex },
        { tags: regex }
      ];
    }

    const faqs = await SupportFAQ.find(query).sort({ order: 1, createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: faqs.length,
      faqs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/support/tickets
 * Create a new support ticket (with optional order linking and image attachment)
 */
export const createTicket = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      category = "Orders",
      orderId,
      issueType = "General Issue",
      subject,
      description,
      priority = "Medium"
    } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: "Please provide a subject and detailed description of the issue."
      });
    }

    let linkedOrder = null;
    let orderIdText = "";

    if (orderId) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(orderId);
      if (isObjectId) {
        linkedOrder = await Order.findOne({ _id: orderId, user: userId });
        if (linkedOrder) {
          orderIdText = linkedOrder._id.toString().slice(-6).toUpperCase();
        }
      }
    }

    // Attachment file from multer if uploaded
    let attachmentUrl = "";
    if (req.file) {
      attachmentUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.attachment) {
      attachmentUrl = req.body.attachment;
    }

    // Auto-generate ticketId: SUP-XXXX
    let ticketId = "";
    let isUnique = false;
    while (!isUnique) {
      const randNum = Math.floor(1000 + Math.random() * 9000);
      ticketId = `SUP-${randNum}`;
      const exists = await SupportTicket.findOne({ ticketId });
      if (!exists) isUnique = true;
    }

    const userName = req.user.fullName || req.user.name || "Valued Customer";
    const userEmail = req.user.email || "";
    const userPhone = req.user.phone || "";

    const ticket = await SupportTicket.create({
      ticketId,
      user: userId,
      userName,
      userEmail,
      userPhone,
      order: linkedOrder ? linkedOrder._id : null,
      orderIdText,
      category,
      issueType,
      subject: subject.trim(),
      description: description.trim(),
      attachment: attachmentUrl,
      priority,
      status: "Open",
      messages: [
        {
          sender: "user",
          senderName: userName,
          message: description.trim(),
          attachment: attachmentUrl,
          createdAt: new Date()
        },
        {
          sender: "system",
          senderName: "FoodExpress Care Assistant",
          message: `Hello ${userName.split(" ")[0]}! Thank you for reaching out. We have logged ticket #${ticketId} regarding "${subject.trim()}"${orderIdText ? ` for Order #${orderIdText}` : ""}. A support care specialist is reviewing your details and will assist you shortly.`,
          createdAt: new Date(Date.now() + 1000)
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: `Support ticket #${ticketId} created successfully!`,
      ticket
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/support/tickets
 * Get authenticated user support tickets (with status filter and search)
 */
export const getUserTickets = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { status = "all", search = "" } = req.query;

    const query = { user: userId };

    if (status && status !== "all") {
      query.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      const regex = new RegExp(q, "i");
      query.$or = [
        { ticketId: regex },
        { subject: regex },
        { description: regex },
        { orderIdText: regex },
        { issueType: regex }
      ];
    }

    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .populate("order", "items totalAmount finalAmount orderStatus createdAt");

    return res.status(200).json({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/support/tickets/:id
 * Get single ticket details and conversation thread (strictly enforced ownership)
 */
export const getTicketDetails = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { _id: id } : { ticketId: id.toUpperCase().trim() };

    const ticket = await SupportTicket.findOne(query).populate(
      "order",
      "items totalAmount finalAmount deliveryCharge discount paymentMethod paymentStatus orderStatus createdAt"
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found."
      });
    }

    // Security: Check Ownership
    const isOwner = ticket.user.toString() === userId.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to access this support ticket."
      });
    }

    return res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/support/tickets/:id/messages
 * Reply to an existing support ticket thread
 */
export const replyToTicket = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message to send."
      });
    }

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { _id: id } : { ticketId: id.toUpperCase().trim() };

    const ticket = await SupportTicket.findOne(query);

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Support ticket not found." });
    }

    // Ownership check
    const isOwner = ticket.user.toString() === userId.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    const sender = isAdmin ? "support" : "user";
    const senderName = isAdmin
      ? (req.user.name || "FoodExpress Support")
      : (req.user.fullName || req.user.name || "You");

    let attachmentUrl = "";
    if (req.file) {
      attachmentUrl = `/uploads/${req.file.filename}`;
    }

    ticket.messages.push({
      sender,
      senderName,
      message: message.trim(),
      attachment: attachmentUrl,
      createdAt: new Date()
    });

    // Update status if closed or waiting
    if (ticket.status === "Waiting for User" && !isAdmin) {
      ticket.status = "In Progress";
    }

    await ticket.save();

    return res.status(200).json({
      success: true,
      message: "Message sent.",
      ticket
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/support/tickets/:id/feedback
 * Submit customer satisfaction rating (1-5 stars) for resolved/closed tickets
 */
export const submitTicketFeedback = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { rating, comment = "" } = req.body;

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid rating between 1 and 5 stars."
      });
    }

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { _id: id } : { ticketId: id.toUpperCase().trim() };

    const ticket = await SupportTicket.findOne(query);

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Support ticket not found." });
    }

    if (ticket.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    if (ticket.status !== "Resolved" && ticket.status !== "Closed") {
      return res.status(400).json({
        success: false,
        message: "Feedback can only be submitted for resolved or closed support tickets."
      });
    }

    if (ticket.feedback && ticket.feedback.rating) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted feedback for this ticket."
      });
    }

    ticket.feedback = {
      rating: Number(rating),
      comment: comment.trim(),
      submittedAt: new Date()
    };

    await ticket.save();

    return res.status(200).json({
      success: true,
      message: "🎉 Thank you for your valuable feedback! It helps us serve you better.",
      ticket
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/support/orders/:orderId/cancel
 * Quick order cancellation through Help Center
 */
export const cancelOrderThroughSupport = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.orderStatus === "Delivered" || order.orderStatus === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: `This order cannot be cancelled because it is already ${order.orderStatus}.`
      });
    }

    if (order.orderStatus === "Out for Delivery" || order.orderStatus === "Preparing") {
      return res.status(400).json({
        success: false,
        message: `Kitchen has already prepared your food. Immediate cancellation is not possible; please create a support ticket for assistance.`
      });
    }

    order.orderStatus = "Cancelled";
    await order.save();

    // Restore food item stocks
    for (const item of order.items) {
      try {
        await Food.findByIdAndUpdate(item.food, { $inc: { stock: item.quantity } });
      } catch (e) {}
    }

    // Auto-create resolved support ticket recording cancellation & refund
    const ticketId = `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
    await SupportTicket.create({
      ticketId,
      user: userId,
      userName: req.user.fullName || req.user.name || "Customer",
      userEmail: req.user.email || "",
      order: order._id,
      orderIdText: order._id.toString().slice(-6).toUpperCase(),
      category: "Orders",
      issueType: "Order Cancellation",
      subject: `Order #${order._id.toString().slice(-6).toUpperCase()} Cancelled via Support`,
      description: `Customer cancelled order before kitchen preparation commenced. Full refund of ₹${order.finalAmount} initiated.`,
      status: "Resolved",
      resolvedAt: new Date(),
      messages: [
        {
          sender: "system",
          senderName: "FoodExpress System",
          message: `Order #${order._id.toString().slice(-6).toUpperCase()} was successfully cancelled. If paid online, a full refund of ₹${order.finalAmount} will be credited to your account.`,
          createdAt: new Date()
        }
      ]
    });

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully. Full refund initiated.",
      order
    });
  } catch (error) {
    next(error);
  }
};
