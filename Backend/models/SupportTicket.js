import mongoose from "mongoose";

const supportMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["user", "support", "system"],
      default: "user"
    },
    senderName: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    attachment: {
      type: String,
      default: ""
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    userName: {
      type: String,
      required: true
    },
    userEmail: {
      type: String,
      required: true
    },
    userPhone: {
      type: String,
      default: ""
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      index: true
    },
    orderIdText: {
      type: String,
      default: ""
    },
    category: {
      type: String,
      enum: ["Orders", "Delivery", "Payments", "Refunds", "Wallet", "Rewards", "Account", "Restaurant", "Safety", "Other"],
      default: "Orders",
      index: true
    },
    issueType: {
      type: String,
      default: "General Inquiry",
      trim: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    attachment: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Waiting for User", "Resolved", "Closed"],
      default: "Open",
      index: true
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium"
    },
    messages: [supportMessageSchema],
    assignedTo: {
      type: String,
      default: "FoodExpress Care Team"
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, default: "" },
      submittedAt: { type: Date }
    },
    resolvedAt: {
      type: Date
    },
    closedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

supportTicketSchema.index({ user: 1, createdAt: -1 });

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);

export default SupportTicket;
