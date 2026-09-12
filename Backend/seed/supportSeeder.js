import SupportFAQ from "../models/SupportFAQ.js";
import SupportTicket from "../models/SupportTicket.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

const DEFAULT_FAQS = [
  // 1. Orders
  {
    category: "Orders",
    question: "How can I cancel my order?",
    answer: 'You can cancel your order directly from the My Orders page or this Help Center if the kitchen has not yet started preparing it (orders in "Placed" or "Confirmed" status). Once the food is "Preparing" or "Out for Delivery", cancellation is restricted to avoid food waste.',
    tags: ["cancel", "cancellation", "order cancel", "stop order"],
    order: 1
  },
  {
    category: "Orders",
    question: "What if my food is delivered with missing or incorrect items?",
    answer: 'If any dish or add-on is missing or different from what you ordered, select the order in the Recent Orders section above and click "Get Help" -> "Food missing" or "Wrong food received". Provide a quick description. Our support team will verify with the restaurant and immediately issue an item refund or wallet credit.',
    tags: ["missing", "wrong food", "missing item", "incorrect item", "incomplete order"],
    order: 2
  },
  {
    category: "Orders",
    question: "What should I do if my food arrived damaged or spilled?",
    answer: 'We sincerely apologize for any mishandling. Please click "Get Help With an Order", choose "Food damaged/spilled", and attach a photo of the packaging. We will prioritize your ticket and issue a quick replacement or instant refund.',
    tags: ["damaged", "spilled", "packaging", "leakage", "cold food"],
    order: 3
  },

  // 2. Delivery
  {
    category: "Delivery",
    question: "Where is my order? How do I track it in real time?",
    answer: 'You can view live delivery progress by clicking "Track Order" on any active order in your Dashboard or Support center. You will see whether your order is being prepared, picked up, or on its way, along with the estimated arrival countdown.',
    tags: ["track", "where is my order", "live tracking", "delivery status", "eta"],
    order: 4
  },
  {
    category: "Delivery",
    question: "What if my delivery is running late?",
    answer: 'Deliveries may occasionally experience minor delays due to adverse weather, road traffic, or peak kitchen hours. If your delivery exceeds the estimated time by more than 15 minutes, select "Late delivery" under Order Help to alert our dispatch team.',
    tags: ["late", "delay", "running late", "delayed delivery", "traffic"],
    order: 5
  },
  {
    category: "Delivery",
    question: "How do I change my delivery address after placing an order?",
    answer: 'If your delivery partner has not yet picked up the package, please contact Support immediately via a ticket or call. If the new address is within the restaurant delivery radius, our dispatch team can update the delivery instructions.',
    tags: ["change address", "wrong address", "update address", "delivery location"],
    order: 6
  },

  // 3. Payments
  {
    category: "Payments",
    question: "Payment failed, but money was deducted from my bank/UPI. What should I do?",
    answer: 'If money was debited for an unsuccessful order, your banking network holds the funds in transit. In 99% of cases, banks automatically reverse this amount within 2 to 4 business hours, or at most 3 to 5 banking days. If the money does not return within 48 hours, raise a ticket here with your UPI reference or bank transaction ID.',
    tags: ["payment failed", "money deducted", "debited", "upi failed", "bank deduction"],
    order: 7
  },
  {
    category: "Payments",
    question: "Which payment methods does FoodExpress support?",
    answer: 'FoodExpress accepts all major payment methods including UPI (Google Pay, PhonePe, Paytm), Credit & Debit cards (Visa, MasterCard, RuPay), Net Banking, FoodExpress Wallet, and Cash on Delivery.',
    tags: ["payment methods", "upi", "cards", "wallet", "cod", "cash on delivery"],
    order: 8
  },

  // 4. Refunds
  {
    category: "Refunds",
    question: "How long does a refund take to reflect?",
    answer: 'Refunds to FoodExpress Wallet are INSTANT (within seconds). For original payment methods (UPI, Credit/Debit card, Net Banking), refunds are initiated immediately by FoodExpress and typically reflect in your bank account within 2 to 5 business days depending on your bank.',
    tags: ["refund time", "how long refund", "refund status", "when refund", "bank refund"],
    order: 9
  },
  {
    category: "Refunds",
    question: "Can I receive my refund directly into my FoodExpress Wallet?",
    answer: 'Yes! Choosing a wallet refund is the fastest way to get your money back. Wallet refunds are processed instantly with zero waiting period and can be used on any future order or checkout.',
    tags: ["wallet refund", "instant refund", "speedy refund", "refund preference"],
    order: 10
  },

  // 5. Wallet
  {
    category: "Wallet",
    question: "How do I add money to my FoodExpress Wallet?",
    answer: 'Navigate to your Profile -> Wallet card and click "Add Money". Enter the amount (minimum ₹100), select your preferred payment mode (UPI, Card, or Net Banking), and complete the secure transaction. Your wallet balance updates immediately.',
    tags: ["add money", "wallet balance", "top up", "recharge wallet"],
    order: 11
  },
  {
    category: "Wallet",
    question: "What if my wallet balance was deducted incorrectly?",
    answer: 'Check your transaction ledger in Profile -> Wallet Transactions. If an order failed while using wallet funds, the balance is restored automatically. If you notice any discrepancy, submit a support ticket under the "Wallet" category.',
    tags: ["wallet deduction", "wallet error", "incorrect balance", "wallet issue"],
    order: 12
  },

  // 6. Rewards
  {
    category: "Rewards",
    question: "How do FoodExpress Reward Points work?",
    answer: 'You earn 10 reward points for every ₹100 spent on all completed food orders (10% back). Points can be redeemed on the Rewards page (/rewards) for discount coupons, free delivery vouchers, and instant wallet cash.',
    tags: ["rewards", "points", "loyalty", "earn points", "redeem points"],
    order: 13
  },
  {
    category: "Rewards",
    question: "Why did my reward voucher or promo code fail to apply?",
    answer: 'Each reward voucher or offer has specific terms, such as a minimum order value (e.g., ₹299) or single-use restrictions. Ensure your cart subtotal meets the threshold before taxes. You can verify all voucher rules directly on the /rewards or /offers page.',
    tags: ["voucher not working", "coupon failed", "promo invalid", "discount not applied"],
    order: 14
  },

  // 7. Account
  {
    category: "Account",
    question: "How can I update my phone number or saved delivery addresses?",
    answer: 'Go to your Profile page (/profile). Under "Delivery Addresses", you can add, edit, or set default delivery addresses. You can also update your display name, birthday, and contact preferences anytime.',
    tags: ["update phone", "change address", "profile settings", "edit account"],
    order: 15
  },

  // 8. Restaurant & Safety
  {
    category: "Restaurant",
    question: "How do I report an urgent food safety or allergen concern?",
    answer: 'Customer health and safety is our utmost priority. If you experienced a severe food safety, hygiene, or undeclared allergen issue, please select "Report Food Safety Issue" at the bottom of this page or raise an Urgent ticket. Our safety compliance team will immediately escalate the matter with the restaurant partner.',
    tags: ["safety", "allergy", "food poisoning", "hygiene", "unsafe food", "foreign object"],
    order: 16
  }
];

export const seedSupport = async () => {
  try {
    const count = await SupportFAQ.countDocuments();
    if (count === 0) {
      await SupportFAQ.insertMany(DEFAULT_FAQS);
      console.log("ℹ️ Seeded 16 Support FAQs across all help categories.");
    }

    // Seed sample support ticket for existing customer if none exists
    const customer = await User.findOne({ role: "customer" });
    if (customer) {
      const ticketCount = await SupportTicket.countDocuments({ user: customer._id });
      if (ticketCount === 0) {
        const recentOrder = await Order.findOne({ user: customer._id }).sort({ createdAt: -1 });
        const sampleTicket = {
          ticketId: "SUP-1024",
          user: customer._id,
          userName: customer.fullName || customer.name || "Customer",
          userEmail: customer.email || "customer@foodexpress.com",
          userPhone: customer.phone || "+91 98765 43210",
          order: recentOrder ? recentOrder._id : null,
          orderIdText: recentOrder ? recentOrder._id.toString().slice(-6).toUpperCase() : "A2D535",
          category: "Orders",
          issueType: "Late delivery",
          subject: "Order arrived 20 minutes past estimated time",
          description: "My lunch delivery was delayed due to heavy rain. The food packaging was fine, but I wanted to check if there is an update on delay compensation.",
          status: "In Progress",
          priority: "Medium",
          assignedTo: "FoodExpress Care Specialist (Sneha)",
          messages: [
            {
              sender: "user",
              senderName: customer.fullName || "You",
              message: "My lunch delivery was delayed due to heavy rain. Wanted to check on delay compensation.",
              createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
            },
            {
              sender: "support",
              senderName: "Sneha (FoodExpress Care)",
              message: "Hello! Thank you for reaching out. We apologize for the delay caused by weather conditions. We have credited ₹50 FoodExpress cashback to your wallet as a courtesy apology. Please let us know if you need anything else!",
              createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000)
            }
          ]
        };
        await SupportTicket.create(sampleTicket);
        console.log("ℹ️ Seeded initial sample Support Ticket #SUP-1024 for customer.");
      }
    }
  } catch (err) {
    console.warn("Support seeder note:", err.message);
  }
};
