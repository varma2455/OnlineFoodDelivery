import RewardCatalog from "../models/RewardCatalog.js";
import RewardTransaction from "../models/RewardTransaction.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

const DEFAULT_REWARDS = [
  {
    title: "₹50 OFF Your Next Feast",
    subtitle: "Flat ₹50 savings on any favorite restaurant",
    description: "Enjoy ₹50 off on orders above ₹299. Valid across all restaurants and categories.",
    pointsCost: 500,
    rewardType: "discount_flat",
    discountValue: 50,
    minimumOrderValue: 299,
    maximumDiscount: 50,
    validityDays: 30,
    applicableCategories: ["All"],
    icon: "🎁",
    badge: "Most Popular",
    badgeColor: "#ff5200",
    termsAndConditions: [
      "Requires minimum cart subtotal of ₹299.",
      "Valid for 30 days from date of redemption.",
      "Cannot be combined with another promotional voucher in the same order."
    ]
  },
  {
    title: "Free Delivery Voucher",
    subtitle: "Zero delivery fee on your next hungry craving",
    description: "Get free delivery on orders above ₹199 from any partner kitchen.",
    pointsCost: 300,
    rewardType: "free_delivery",
    discountValue: 40,
    minimumOrderValue: 199,
    maximumDiscount: 40,
    validityDays: 30,
    applicableCategories: ["All"],
    icon: "🚚",
    badge: "Low Points",
    badgeColor: "#10b981",
    termsAndConditions: [
      "Minimum order value of ₹199 applies.",
      "Waives standard delivery fee up to ₹40.",
      "Single-use voucher valid for 30 days."
    ]
  },
  {
    title: "₹100 Gourmet Food Discount",
    subtitle: "Flat ₹100 discount on big meal cravings",
    description: "Save a massive ₹100 on orders above ₹499 from top rated culinary spots.",
    pointsCost: 800,
    rewardType: "discount_flat",
    discountValue: 100,
    minimumOrderValue: 499,
    maximumDiscount: 100,
    validityDays: 45,
    applicableCategories: ["All"],
    icon: "🍕",
    badge: "Best Value",
    badgeColor: "#8b5cf6",
    termsAndConditions: [
      "Valid on order subtotals of ₹499 or higher.",
      "Applies flat ₹100 discount at checkout.",
      "Valid for 45 days after redemption."
    ]
  },
  {
    title: "20% OFF Special Dining",
    subtitle: "Save 20% up to ₹120 on premium orders",
    description: "Perfect for family lunches and celebratory dinners.",
    pointsCost: 600,
    rewardType: "discount_percent",
    discountValue: 20,
    minimumOrderValue: 349,
    maximumDiscount: 120,
    validityDays: 30,
    applicableCategories: ["All"],
    icon: "✨",
    badge: "Hot Deal",
    badgeColor: "#ec4899",
    termsAndConditions: [
      "20% discount capped at maximum ₹120.",
      "Minimum cart value ₹349 before discount.",
      "Single use coupon valid for 30 days."
    ]
  },
  {
    title: "₹50 Instant Wallet Credit",
    subtitle: "Direct ₹50 cashback added straight to your wallet",
    description: "Convert 500 reward points into real FoodExpress wallet money.",
    pointsCost: 500,
    rewardType: "wallet_cashback",
    discountValue: 50,
    minimumOrderValue: 0,
    maximumDiscount: 50,
    validityDays: 365,
    applicableCategories: ["All"],
    icon: "💳",
    badge: "Cash Credit",
    badgeColor: "#059669",
    termsAndConditions: [
      "Immediately credited to your FoodExpress wallet.",
      "Can be used to pay for any order or checkout item.",
      "No minimum order required when paying via wallet."
    ]
  },
  {
    title: "₹25 Quick Snack Discount",
    subtitle: "Instant ₹25 OFF on snacks, chai, and drinks",
    description: "Quick small treat discount with low point threshold.",
    pointsCost: 250,
    rewardType: "discount_flat",
    discountValue: 25,
    minimumOrderValue: 149,
    maximumDiscount: 25,
    validityDays: 20,
    applicableCategories: ["All"],
    icon: "🍔",
    badge: "Starter",
    badgeColor: "#f59e0b",
    termsAndConditions: [
      "Minimum cart amount of ₹149 required.",
      "Valid on snacks, beverages, and desserts.",
      "Valid for 20 days."
    ]
  },
  {
    title: "₹200 Royal Feast Savings",
    subtitle: "VIP Tier Reward - Flat ₹200 OFF grand orders",
    description: "Our highest value reward voucher for big party and family feasts.",
    pointsCost: 1500,
    rewardType: "discount_flat",
    discountValue: 200,
    minimumOrderValue: 899,
    maximumDiscount: 200,
    validityDays: 60,
    applicableCategories: ["All"],
    icon: "👑",
    badge: "VIP Reward",
    badgeColor: "#d97706",
    termsAndConditions: [
      "Valid on grand orders of ₹899 and above.",
      "Flat ₹200 savings applied instantly.",
      "Valid for 60 days."
    ]
  }
];

export const seedRewards = async () => {
  try {
    const existingCount = await RewardCatalog.countDocuments();
    if (existingCount === 0) {
      await RewardCatalog.insertMany(DEFAULT_REWARDS);
      console.log("🎁 Seeded 7 default Reward Catalog items.");
    }

    // Provision reward history for users who have orders or points but 0 transactions
    const users = await User.find({ role: "customer" }).limit(10);
    for (const u of users) {
      const txCount = await RewardTransaction.countDocuments({ user: u._id });
      if (txCount === 0) {
        let runningBalance = 0;
        const txs = [];

        // 1. Welcome Bonus
        runningBalance += 50;
        txs.push({
          user: u._id,
          type: "bonus",
          points: 50,
          balanceAfter: runningBalance,
          title: "Welcome Bonus Points",
          description: "Earned for creating your FoodExpress account 🎉",
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        });

        // 2. Points from recent orders
        const orders = await Order.find({ user: u._id }).sort({ createdAt: 1 }).limit(5);
        for (const ord of orders) {
          const earned = Math.max(10, Math.floor((ord.totalAmount || 300) * 0.1));
          runningBalance += earned;
          txs.push({
            user: u._id,
            type: "earned",
            points: earned,
            balanceAfter: runningBalance,
            title: `Order #${ord._id.toString().slice(-6).toUpperCase()}`,
            description: `10% reward points earned on order of ₹${ord.totalAmount || 300}`,
            order: ord._id,
            orderIdText: ord._id.toString().slice(-6).toUpperCase(),
            createdAt: ord.createdAt || new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
          });
        }

        if (txs.length > 0) {
          await RewardTransaction.insertMany(txs);
          if (u.rewardPoints < runningBalance) {
            u.rewardPoints = runningBalance;
            await u.save();
          }
        }
      }
    }
  } catch (err) {
    console.warn("Reward seeding warning:", err.message);
  }
};
