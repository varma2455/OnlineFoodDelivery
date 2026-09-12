import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

/**
 * Add money to wallet (authenticated)
 * POST /api/wallet/add-money
 */
export const addMoney = async (req, res, next) => {
  try {
    const { amount, paymentMethod } = req.body;

    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount < 10 || numAmount > 50000) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid amount between ₹10 and ₹50,000."
      });
    }

    const validMethods = ["UPI", "Card", "Net Banking"];
    const method = validMethods.includes(paymentMethod) ? paymentMethod : "UPI";

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const currentWallet = Number(user.wallet) || 0;
    const newBalance = currentWallet + numAmount;
    user.wallet = newBalance;
    await user.save();

    // Create transaction record
    const transaction = await Transaction.create({
      user: user._id,
      type: "credit",
      category: "wallet_topup",
      amount: numAmount,
      balanceAfter: newBalance,
      paymentMethod: method,
      description: `Wallet Top-up via ${method}`,
      status: "Success"
    });

    return res.status(200).json({
      success: true,
      message: `₹${numAmount} added successfully to your FoodExpress Wallet! 💰`,
      wallet: newBalance,
      transaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get wallet details and recent transactions
 * GET /api/wallet/details
 */
export const getWalletDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const transactions = await Transaction.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      wallet: user.wallet || 0,
      rewardPoints: user.rewardPoints || 0,
      transactions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get transactions history
 * GET /api/wallet/transactions
 */
export const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    return res.status(200).json({
      success: true,
      transactions
    });
  } catch (error) {
    next(error);
  }
};
