import User from "../models/User.js";
import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";
import RewardTransaction from "../models/RewardTransaction.js";
import MembershipHistory from "../models/MembershipHistory.js";

// Canonical membership plan definitions
export const MEMBERSHIP_PLANS = {
    silver: {
        id: "silver",
        title: "FoodExpress Silver",
        badge: "GOOD START",
        monthlyPrice: 99,
        yearlyPrice: 999,
        yearlySavings: 189, // (99 * 12) - 999 = 189
        discountPercent: 5,
        freeDeliveriesPerMonth: 2,
        monthlyCashback: 50,
        monthlyPoints: 100,
        cta: "START SILVER",
        features: [
            "5% discount on eligible food orders",
            "2 free deliveries every month",
            "₹50 monthly FoodExpress Wallet cashback",
            "100 bonus reward points every month",
            "Member-only offers",
            "Priority access to selected deals",
            "Birthday reward",
            "Saved favorite restaurants",
            "Basic order priority"
        ]
    },
    gold: {
        id: "gold",
        title: "FoodExpress Gold",
        badge: "MOST POPULAR",
        recommended: true,
        monthlyPrice: 199,
        yearlyPrice: 1999,
        yearlySavings: 389, // (199 * 12) - 1999 = 389
        discountPercent: 10,
        freeDeliveriesPerMonth: -1, // Unlimited
        monthlyCashback: 150,
        monthlyPoints: 300,
        cta: "GO GOLD",
        features: [
            "10% discount on eligible food orders",
            "Unlimited free delivery on eligible orders",
            "₹150 monthly FoodExpress Wallet cashback",
            "300 bonus reward points every month",
            "Gold-only exclusive offers",
            "Priority delivery",
            "Early access to flash deals",
            "Birthday special reward",
            "Restaurant-specific member discounts",
            "Priority customer support",
            "Free cancellation on eligible orders",
            "Double reward points on selected restaurants"
        ]
    },
    platinum: {
        id: "platinum",
        title: "FoodExpress Platinum",
        badge: "ULTIMATE MEMBER",
        monthlyPrice: 399,
        yearlyPrice: 3999,
        yearlySavings: 789, // (399 * 12) - 3999 = 789
        discountPercent: 15,
        freeDeliveriesPerMonth: -1, // Unlimited
        monthlyCashback: 300,
        monthlyPoints: 750,
        cta: "GO PLATINUM",
        features: [
            "15% discount on eligible food orders",
            "Unlimited free delivery",
            "₹300 monthly FoodExpress Wallet cashback",
            "750 bonus reward points every month",
            "Platinum-exclusive offers",
            "Priority restaurant access",
            "Priority delivery",
            "Early access to new restaurants",
            "Early access to flash sales",
            "3× reward points on selected orders",
            "Birthday premium reward",
            "Priority customer support",
            "Dedicated membership support",
            "Free cancellation on eligible orders",
            "Exclusive restaurant experiences",
            "Personalized offers based on order history",
            "Surprise member rewards",
            "Special festival offers"
        ]
    }
};

/**
 * Get current user's membership status, actual metrics, and history
 * GET /api/membership/status
 */
export const getMembershipStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select(
            "fullName email phone wallet rewardPoints membership"
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Standardize membership object
        let membership = user.membership;
        if (!membership || typeof membership === "string") {
            const planKey = (typeof membership === "string" ? membership.toLowerCase() : "free");
            membership = {
                plan: planKey === "basic" ? "free" : planKey,
                billingCycle: "monthly",
                status: ["silver", "gold", "platinum"].includes(planKey) ? "active" : "free",
                startDate: null,
                expiryDate: null,
                price: 0,
                autoRenew: false,
                benefits: []
            };
        }

        // Check expiration
        const now = new Date();
        const isActive = membership.status === "active" && (!membership.expiryDate || new Date(membership.expiryDate) > now);
        if (membership.status === "active" && membership.expiryDate && new Date(membership.expiryDate) <= now) {
            membership.status = "expired";
            user.membership.status = "expired";
            await user.save();
        }

        // Calculate REAL metrics for current month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // 1. Orders this month
        const monthlyOrders = await Order.find({
            user: req.user._id,
            createdAt: { $gte: startOfMonth },
            orderStatus: { $ne: "Cancelled" }
        });

        const ordersThisMonth = monthlyOrders.length;

        // 2. Real savings this month (member discount + waived delivery fee + coupon discounts)
        let monthlySavings = 0;
        for (const order of monthlyOrders) {
            if (order.memberDiscount) {
                monthlySavings += order.memberDiscount;
            }
            if (order.memberDeliveryBenefit || (order.deliveryCharge === 0 && order.totalAmount <= 500)) {
                monthlySavings += 40; // Saved standard delivery fee
            }
            if (order.discount && !order.memberDiscount) {
                monthlySavings += order.discount;
            }
        }

        // 3. Rewards earned this month
        const rewardTxnsThisMonth = await RewardTransaction.find({
            user: req.user._id,
            type: { $in: ["earned", "bonus"] },
            createdAt: { $gte: startOfMonth }
        });
        const rewardsEarned = rewardTxnsThisMonth.reduce((acc, t) => acc + (Number(t.points) || 0), 0);

        // 4. Wallet cashback received this month
        const walletCashbacks = await Transaction.find({
            user: req.user._id,
            type: "credit",
            category: "cashback",
            createdAt: { $gte: startOfMonth }
        });
        const walletCashback = walletCashbacks.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

        // 5. Membership payment history
        const history = await MembershipHistory.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10);

        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                wallet: user.wallet,
                rewardPoints: user.rewardPoints
            },
            membership: {
                ...membership.toObject ? membership.toObject() : membership,
                isActive
            },
            metrics: {
                monthlySavings,
                ordersThisMonth,
                rewardsEarned,
                walletCashback
            },
            history,
            plans: MEMBERSHIP_PLANS
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Subscribe / Upgrade Membership
 * POST /api/membership/subscribe
 */
export const subscribeMembership = async (req, res, next) => {
    try {
        const { plan, billingCycle = "monthly", paymentMethod = "Card" } = req.body;

        const cleanPlan = (plan || "").toLowerCase().trim();
        const cleanCycle = (billingCycle || "monthly").toLowerCase().trim();

        if (!MEMBERSHIP_PLANS[cleanPlan]) {
            return res.status(400).json({
                success: false,
                message: "Invalid membership plan selected. Choose Silver, Gold, or Platinum."
            });
        }

        if (!["monthly", "yearly"].includes(cleanCycle)) {
            return res.status(400).json({
                success: false,
                message: "Invalid billing cycle. Choose monthly or yearly."
            });
        }

        const planConfig = MEMBERSHIP_PLANS[cleanPlan];
        const price = cleanCycle === "yearly" ? planConfig.yearlyPrice : planConfig.monthlyPrice;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const transactionId = `TXN_MB_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Payment Processing
        if (paymentMethod === "Wallet") {
            const currentBalance = Number(user.wallet) || 0;
            if (currentBalance < price) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient wallet balance (₹${currentBalance}). Required ₹${price}. Please choose another payment method or add funds.`
                });
            }

            // Deduct wallet
            user.wallet = currentBalance - price;
            await Transaction.create({
                user: user._id,
                type: "debit",
                category: "membership_fee",
                amount: price,
                balanceAfter: user.wallet,
                paymentMethod: "Wallet",
                description: `${planConfig.title} (${cleanCycle}) Membership Fee`,
                status: "Success"
            });
        }

        // Calculate Expiry Date
        const now = new Date();
        const durationDays = cleanCycle === "yearly" ? 365 : 30;
        const expiryDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

        // Award Member Benefits (Cashback + Reward Points)
        const cashbackAmount = planConfig.monthlyCashback;
        const bonusPoints = planConfig.monthlyPoints;

        // Credit Cashback to Wallet
        user.wallet = (Number(user.wallet) || 0) + cashbackAmount;
        await Transaction.create({
            user: user._id,
            type: "credit",
            category: "cashback",
            amount: cashbackAmount,
            balanceAfter: user.wallet,
            paymentMethod: "Wallet",
            description: `${planConfig.title} Welcome Wallet Cashback`,
            status: "Success"
        });

        // Credit Bonus Points to Rewards
        user.rewardPoints = (Number(user.rewardPoints) || 0) + bonusPoints;
        await RewardTransaction.create({
            user: user._id,
            type: "bonus",
            points: bonusPoints,
            balanceAfter: user.rewardPoints,
            title: `${planConfig.title} Monthly Bonus Points`,
            description: `Welcome bonus points for subscribing to ${planConfig.title}`,
            status: "active"
        });

        // Update User Membership
        user.membership = {
            plan: cleanPlan,
            billingCycle: cleanCycle,
            status: "active",
            startDate: now,
            expiryDate,
            price,
            autoRenew: true,
            paymentId: transactionId,
            benefits: planConfig.features
        };

        await user.save();

        // Record in MembershipHistory
        const historyRecord = await MembershipHistory.create({
            user: user._id,
            plan: cleanPlan,
            planTitle: planConfig.title,
            billingCycle: cleanCycle,
            amount: price,
            paymentMethod,
            paymentStatus: "Successful",
            transactionId,
            startDate: now,
            expiryDate,
            benefitsAwarded: {
                walletCashback: cashbackAmount,
                rewardPoints: bonusPoints
            }
        });

        return res.status(200).json({
            success: true,
            message: `Welcome to ${planConfig.title} 🎉`,
            membership: user.membership,
            wallet: user.wallet,
            rewardPoints: user.rewardPoints,
            transaction: historyRecord
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Toggle Auto-Renewal
 * PUT /api/membership/auto-renew
 */
export const toggleAutoRenew = async (req, res, next) => {
    try {
        const { autoRenew } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.membership || user.membership.status !== "active") {
            return res.status(400).json({
                success: false,
                message: "No active membership found to configure auto-renewal."
            });
        }

        user.membership.autoRenew = Boolean(autoRenew);
        await user.save();

        return res.status(200).json({
            success: true,
            message: `Auto-renewal turned ${user.membership.autoRenew ? "ON" : "OFF"}.`,
            autoRenew: user.membership.autoRenew
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cancel Membership
 * PUT /api/membership/cancel
 */
export const cancelMembership = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.membership || user.membership.status !== "active") {
            return res.status(400).json({
                success: false,
                message: "No active membership to cancel."
            });
        }

        // Disable auto-renewal and update status to cancelled
        // Note: Paid benefits remain active until the expiry date!
        user.membership.autoRenew = false;
        user.membership.status = "cancelled";
        await user.save();

        const formattedExpiry = user.membership.expiryDate
            ? new Date(user.membership.expiryDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
              })
            : "end of your billing cycle";

        return res.status(200).json({
            success: true,
            message: `Membership cancelled. Your benefits remain active until ${formattedExpiry}.`,
            membership: user.membership
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Membership Payment History
 * GET /api/membership/history
 */
export const getMembershipHistory = async (req, res, next) => {
    try {
        const history = await MembershipHistory.find({ user: req.user._id }).sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            history
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Get All Memberships
 * GET /api/membership/admin/all
 */
export const getAllMemberships = async (req, res, next) => {
    try {
        const members = await User.find({
            "membership.plan": { $in: ["silver", "gold", "platinum"] }
        }).select("fullName email phone wallet rewardPoints membership createdAt");

        const transactions = await MembershipHistory.find()
            .populate("user", "fullName email phone")
            .sort({ createdAt: -1 })
            .limit(50);

        return res.status(200).json({
            success: true,
            totalMembers: members.length,
            members,
            recentTransactions: transactions
        });
    } catch (error) {
        next(error);
    }
};
