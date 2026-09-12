import User from "../models/User.js";
import RewardCatalog from "../models/RewardCatalog.js";
import RewardTransaction from "../models/RewardTransaction.js";
import RewardVoucher from "../models/RewardVoucher.js";
import Offer from "../models/Offer.js";
import Transaction from "../models/Transaction.js";

/**
 * Calculate Tier based on user points
 */
const getTierInfo = (points) => {
  if (points >= 2500) {
    return {
      name: "Platinum",
      badge: "💎",
      color: "#8b5cf6",
      minPoints: 2500,
      nextTier: null,
      nextTierPoints: 2500,
      pointsToNext: 0,
      progressPct: 100,
      perk: "2X Points on all orders + Free Priority Delivery"
    };
  } else if (points >= 1000) {
    return {
      name: "Gold",
      badge: "🥇",
      color: "#f59e0b",
      minPoints: 1000,
      nextTier: "Platinum",
      nextTierPoints: 2500,
      pointsToNext: 2500 - points,
      progressPct: Math.min(100, Math.round(((points - 1000) / 1500) * 100)),
      perk: "1.5X Points on orders + Exclusive weekend discounts"
    };
  } else if (points >= 500) {
    return {
      name: "Silver",
      badge: "🥈",
      color: "#64748b",
      minPoints: 500,
      nextTier: "Gold",
      nextTierPoints: 1000,
      pointsToNext: 1000 - points,
      progressPct: Math.min(100, Math.round(((points - 500) / 500) * 100)),
      perk: "1.2X Points + Early access to flash sales"
    };
  } else {
    return {
      name: "Bronze",
      badge: "🥉",
      color: "#cd7f32",
      minPoints: 0,
      nextTier: "Silver",
      nextTierPoints: 500,
      pointsToNext: 500 - points,
      progressPct: Math.min(100, Math.round((points / 500) * 100)),
      perk: "Standard 10% Points (10 pts per ₹100 spent)"
    };
  }
};

/**
 * GET /api/rewards
 * Get authenticated user reward profile & live statistics
 */
export const getRewardProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select("name email phone rewardPoints wallet membership referralCode createdAt");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const availablePoints = Number(user.rewardPoints) || 0;
    const tier = getTierInfo(availablePoints);

    // Calculate real stats from RewardTransaction
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const transactions = await RewardTransaction.find({ user: userId });

    // Earned this month
    const earnedThisMonth = transactions
      .filter((t) => t.points > 0 && new Date(t.createdAt) >= startOfMonth)
      .reduce((sum, t) => sum + t.points, 0);

    // Redeemed points total
    const redeemedTotal = Math.abs(
      transactions
        .filter((t) => t.type === "redeemed")
        .reduce((sum, t) => sum + t.points, 0)
    );

    // Expiring soon (transactions older than 335 days, with 30 days remaining in a 365-day cycle)
    const thirtyDaysAgoFromYear = new Date(now.getTime() - 335 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const expiringSoonPoints = transactions
      .filter(
        (t) =>
          t.points > 0 &&
          new Date(t.createdAt) <= thirtyDaysAgoFromYear &&
          new Date(t.createdAt) > oneYearAgo
      )
      .reduce((sum, t) => sum + t.points, 0);

    // Referral Code
    const referralCode =
      user.referralCode ||
      `FE-${(user.name ? user.name.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 8) : user._id.toString().slice(-6).toUpperCase())}`;

    // Ways to Earn
    const waysToEarn = [
      {
        id: "order_food",
        title: "Order Food",
        description: "Earn 10 points for every ₹100 spent on eligible orders.",
        calculation: "₹100 order = +10 points",
        actionText: "Order Now",
        link: "/menu",
        icon: "🛍️",
        accent: "#ff5200"
      },
      {
        id: "rate_order",
        title: "Rate an Order",
        description: "Earn 25 bonus points by leaving feedback and ratings on your deliveries.",
        calculation: "Rating = +25 points",
        actionText: "Rate Now",
        link: "/my-orders",
        icon: "⭐",
        accent: "#f59e0b"
      },
      {
        id: "special_offers",
        title: "Special Bonus Offers",
        description: "Apply bonus coupons such as REWARD2X to earn double points.",
        calculation: "Promo Deals = Up to 2X points",
        actionText: "View Offers",
        link: "/offers",
        icon: "🎉",
        accent: "#ec4899"
      }
    ];

    return res.status(200).json({
      success: true,
      profile: {
        points: availablePoints,
        wallet: Number(user.wallet) || 0,
        tier,
        stats: {
          availablePoints,
          earnedThisMonth,
          redeemedTotal,
          expiringSoon: expiringSoonPoints
        },
        referralCode,
        waysToEarn
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rewards/catalog
 * Get list of available redeemable rewards
 */
export const getRewardCatalog = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    let userPoints = 0;
    if (userId) {
      const user = await User.findById(userId).select("rewardPoints");
      userPoints = Number(user?.rewardPoints) || 0;
    }

    const items = await RewardCatalog.find({ isActive: true }).sort({ pointsCost: 1 });

    const catalog = items.map((item) => {
      const cost = Number(item.pointsCost);
      const canAfford = userPoints >= cost;
      const pointsNeeded = Math.max(0, cost - userPoints);
      return {
        ...item.toObject(),
        canAfford,
        pointsNeeded,
        currentUserPoints: userPoints
      };
    });

    return res.status(200).json({
      success: true,
      userPoints,
      catalog
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/rewards/:id/redeem
 * Perform actual backend redemption: checks points, deducts, creates voucher & offer
 */
export const redeemReward = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const reward = await RewardCatalog.findById(id);
    if (!reward || !reward.isActive) {
      return res.status(404).json({
        success: false,
        message: "This reward is not currently available for redemption."
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const currentPoints = Number(user.rewardPoints) || 0;
    const cost = Number(reward.pointsCost);

    // Strict validation
    if (currentPoints < cost) {
      return res.status(400).json({
        success: false,
        insufficient: true,
        message: `Not enough points. You need ${cost} points to redeem this reward. You currently have ${currentPoints} points.`,
        required: cost,
        available: currentPoints,
        diff: cost - currentPoints
      });
    }

    // Deduct points
    user.rewardPoints = currentPoints - cost;

    let voucher = null;
    let successMessage = `Successfully redeemed "${reward.title}"!`;

    // Handle Wallet Cashback vs Food Voucher
    if (reward.rewardType === "wallet_cashback") {
      const currentWallet = Number(user.wallet) || 0;
      const creditAmount = Number(reward.discountValue) || 50;
      user.wallet = currentWallet + creditAmount;

      // Create Wallet Transaction
      await Transaction.create({
        user: user._id,
        type: "credit",
        category: "cashback",
        amount: creditAmount,
        balanceAfter: user.wallet,
        paymentMethod: "Wallet",
        description: `Reward points converted to wallet credit (${reward.title})`
      });

      successMessage = `🎉 Converted ${cost} points into ₹${creditAmount} Wallet Credit! New Wallet Balance: ₹${user.wallet}.`;
    } else {
      // Generate Unique Voucher Code: REW-[VALUE]-[RANDOM]
      const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const code = `REW-${reward.discountValue}-${randPart}`;
      const expiryDate = new Date(Date.now() + (reward.validityDays || 30) * 24 * 60 * 60 * 1000);

      voucher = await RewardVoucher.create({
        user: user._id,
        reward: reward._id,
        code,
        title: reward.title,
        rewardType: reward.rewardType,
        discountValue: reward.discountValue,
        minimumOrderValue: reward.minimumOrderValue,
        maximumDiscount: reward.maximumDiscount,
        expiryDate,
        status: "Available"
      });

      // Register corresponding Offer so it directly validates at Cart/Checkout!
      const offerDiscountType =
        reward.rewardType === "discount_percent"
          ? "percentage"
          : reward.rewardType === "free_delivery"
          ? "free_delivery"
          : "flat";

      await Offer.create({
        title: `Voucher: ${reward.title}`,
        subtitle: `Redeemed using ${cost} reward points`,
        code,
        discountType: offerDiscountType,
        discountValue: reward.discountValue,
        minimumOrderValue: reward.minimumOrderValue || 0,
        maximumDiscount: reward.maximumDiscount || reward.discountValue,
        category: "rewards",
        applicableCategories: reward.applicableCategories || ["All"],
        startDate: new Date(),
        expiryDate,
        usageLimit: 1,
        perUserLimit: 1,
        termsAndConditions: reward.termsAndConditions || [
          `Single use reward voucher worth ₹${reward.discountValue}.`
        ],
        highlightTag: "🎁 REWARD VOUCHER",
        badgeColor: reward.badgeColor || "#ff5200"
      });

      // Add to user.coupons array for legacy compatibility
      user.coupons = user.coupons || [];
      user.coupons.push({
        code,
        discount: reward.discountValue,
        expiry: expiryDate
      });
    }

    // Record Reward Transaction
    await RewardTransaction.create({
      user: user._id,
      type: "redeemed",
      points: -cost,
      balanceAfter: user.rewardPoints,
      title: `Redeemed ${reward.title}`,
      description: reward.description || `Redeemed ${cost} points for ${reward.title}`,
      reward: reward._id,
      voucherCode: voucher ? voucher.code : ""
    });

    // Update timesRedeemed
    await RewardCatalog.findByIdAndUpdate(reward._id, { $inc: { timesRedeemed: 1 } });

    await user.save();

    return res.status(200).json({
      success: true,
      message: successMessage,
      voucher,
      newBalance: user.rewardPoints,
      newWallet: user.wallet
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rewards/redeemed
 * List all redeemed vouchers for the authenticated user
 */
export const getRedeemedRewards = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const vouchers = await RewardVoucher.find({ user: userId })
      .populate("reward", "icon badge badgeColor")
      .sort({ createdAt: -1 });

    const now = new Date();
    // Auto-update expired status
    const updatedVouchers = await Promise.all(
      vouchers.map(async (v) => {
        if (v.status === "Available" && new Date(v.expiryDate) < now) {
          v.status = "Expired";
          await v.save();
        }
        return v;
      })
    );

    return res.status(200).json({
      success: true,
      vouchers: updatedVouchers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rewards/history
 * List points history with search and category filtering
 */
export const getRewardHistory = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { type = "all", search = "" } = req.query;

    const query = { user: userId };

    if (type && type !== "all") {
      query.type = type.toLowerCase().trim();
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: regex },
        { description: regex },
        { orderIdText: regex },
        { voucherCode: regex }
      ];
    }

    const transactions = await RewardTransaction.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      transactions,
      count: transactions.length
    });
  } catch (error) {
    next(error);
  }
};
