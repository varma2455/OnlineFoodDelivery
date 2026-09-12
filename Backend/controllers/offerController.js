import Offer from "../models/Offer.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

/**
 * Get All Active Offers with Filtering, Search, Sorting, and Personalization
 * GET /api/offers
 */
export const getOffers = async (req, res, next) => {
  try {
    const { category, search, city, sort } = req.query;
    const now = new Date();

    // Base query: active offers whose expiry date is in the future
    let query = {
      isActive: true,
      expiryDate: { $gt: now },
      startDate: { $lte: now }
    };

    // City filter if specified and not "All"
    if (city && city !== "All") {
      query.$or = [{ city: "All" }, { city: new RegExp(city, "i") }];
    }

    // Category filter
    if (category && category !== "all") {
      query.category = category.toLowerCase();
    }

    // Search filter
    if (search && search.trim()) {
      const sRegex = new RegExp(search.trim(), "i");
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { title: sRegex },
            { subtitle: sRegex },
            { code: sRegex },
            { applicableCategories: { $in: [sRegex] } },
            { applicableRestaurants: { $in: [sRegex] } }
          ]
        }
      ];
    }

    // Fetch all active offers for counting and recommendations
    const allActiveOffers = await Offer.find({
      isActive: true,
      expiryDate: { $gt: now },
      startDate: { $lte: now }
    });

    // Check user authentication context
    const userId = req.user?._id || req.user?.id;
    let user = null;
    let userOrderCount = 0;
    let savedOfferIds = [];

    if (userId) {
      user = await User.findById(userId);
      if (user) {
        userOrderCount = await Order.countDocuments({ user: user._id });
        savedOfferIds = (user.savedOffers || []).map((id) => id.toString());
      }
    }

    // Fetch matching offers
    let offers = await Offer.find(query);

    // Compute user eligibility & remaining days for each offer
    const formatOffer = (offer) => {
      const daysLeft = Math.ceil((new Date(offer.expiryDate) - now) / (1000 * 60 * 60 * 24));
      let isEligible = true;
      let ineligibilityReason = "";

      // New User rule
      if (offer.isNewUserOnly && user && userOrderCount > 0) {
        isEligible = false;
        ineligibilityReason = "Valid only for new users on their first order.";
      }

      // Per-user limit rule
      if (userId && offer.usedBy && offer.usedBy.length > 0) {
        const userUsage = offer.usedBy.filter(
          (u) => u.user && u.user.toString() === userId.toString()
        ).length;
        if (userUsage >= (offer.perUserLimit || 1)) {
          isEligible = false;
          ineligibilityReason = "You have already reached the maximum redemption limit for this offer.";
        }
      }

      // Total usage limit rule
      if (offer.usedCount >= (offer.usageLimit || 10000)) {
        isEligible = false;
        ineligibilityReason = "This offer has reached its maximum total redemptions.";
      }

      const isSaved = savedOfferIds.includes(offer._id.toString());

      return {
        ...offer.toObject(),
        daysLeft,
        isExpiringSoon: daysLeft <= 3,
        isEligible,
        ineligibilityReason,
        isSaved
      };
    };

    let formattedOffers = offers.map(formatOffer);

    // If "saved" category was requested, filter to saved offers
    if (category === "saved") {
      formattedOffers = formattedOffers.filter((o) => o.isSaved);
    }

    // Sorting
    switch (sort) {
      case "highest_discount":
        formattedOffers.sort((a, b) => b.discountValue - a.discountValue);
        break;
      case "lowest_min_order":
        formattedOffers.sort((a, b) => (a.minimumOrderValue || 0) - (b.minimumOrderValue || 0));
        break;
      case "expiring_soon":
        formattedOffers.sort((a, b) => a.daysLeft - b.daysLeft);
        break;
      case "newest":
        formattedOffers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "best":
      default:
        // Priority: high discount, lower min order, eligible first
        formattedOffers.sort((a, b) => {
          if (a.isEligible !== b.isEligible) return a.isEligible ? -1 : 1;
          return b.discountValue - a.discountValue;
        });
        break;
    }

    // Compute Category Counts across all active offers
    const counts = {
      all: allActiveOffers.length,
      food: allActiveOffers.filter((o) => o.category === "food").length,
      restaurants: allActiveOffers.filter((o) => o.category === "restaurants").length,
      delivery: allActiveOffers.filter((o) => o.category === "delivery").length,
      new_user: allActiveOffers.filter((o) => o.category === "new_user").length,
      wallet: allActiveOffers.filter((o) => o.category === "wallet").length,
      rewards: allActiveOffers.filter((o) => o.category === "rewards").length,
      limited_time: allActiveOffers.filter((o) => o.category === "limited_time").length,
      saved: savedOfferIds.length
    };

    // Compute Personalized / Recommended Offers
    let recommended = [];
    const formattedAll = allActiveOffers.map(formatOffer);

    if (user && userOrderCount === 0) {
      // Prioritize new user welcome offers
      recommended = formattedAll.filter((o) => o.isNewUserOnly && o.isEligible).slice(0, 3);
    } else if (user) {
      // Prioritize highest value deals user is eligible for
      recommended = formattedAll
        .filter((o) => o.isEligible && !o.isNewUserOnly)
        .sort((a, b) => b.discountValue - a.discountValue)
        .slice(0, 3);
    } else {
      // General top 3
      recommended = formattedAll.slice(0, 3);
    }

    // Compute Expiring Soon offers (within 3 days)
    const expiringSoon = formattedAll
      .filter((o) => o.daysLeft <= 3 && o.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    return res.status(200).json({
      success: true,
      count: formattedOffers.length,
      totalAvailable: allActiveOffers.length,
      location: city || user?.city || "Hyderabad",
      counts,
      offers: formattedOffers,
      recommended,
      expiringSoon
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Offer by Code or ID
 * GET /api/offers/:codeOrId
 */
export const getOfferDetails = async (req, res, next) => {
  try {
    const { codeOrId } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(codeOrId);

    const offer = isObjectId
      ? await Offer.findById(codeOrId)
      : await Offer.findOne({ code: codeOrId.toUpperCase().trim() });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found."
      });
    }

    return res.status(200).json({
      success: true,
      offer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validate and Calculate Offer Discount
 * POST /api/offers/validate
 */
export const validateOffer = async (req, res, next) => {
  try {
    const { code, cartItems = [], restaurant = "" } = req.body;
    const rawSubtotal = req.body.cartSubtotal ?? req.body.cartAmount ?? req.body.amount ?? req.body.subtotal ?? 0;
    const cartSubtotal = Number(rawSubtotal) || 0;

    if (!code) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Please enter or select a promo code."
      });
    }

    const cleanCode = code.toUpperCase().trim();
    const offer = await Offer.findOne({ code: cleanCode });

    if (!offer) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: `Promo code "${cleanCode}" does not exist.`
      });
    }

    if (!offer.isActive) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Offer "${cleanCode}" is no longer active.`
      });
    }

    const now = new Date();
    if (now > new Date(offer.expiryDate)) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Offer "${cleanCode}" has expired.`
      });
    }

    if (now < new Date(offer.startDate)) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Offer "${cleanCode}" is not yet active.`
      });
    }

    if (offer.usedCount >= (offer.usageLimit || 10000)) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Offer "${cleanCode}" redemption limit has been reached.`
      });
    }

    const userId = req.user?._id || req.user?.id;
    if (userId) {
      // Check user order history for new-user-only offers
      if (offer.isNewUserOnly) {
        const orderCount = await Order.countDocuments({ user: userId });
        if (orderCount > 0) {
          return res.status(400).json({
            success: false,
            valid: false,
            message: `Offer "${cleanCode}" is exclusively for new customers on their first order.`
          });
        }
      }

      // Check per-user limit
      const userUsage = (offer.usedBy || []).filter(
        (u) => u.user && u.user.toString() === userId.toString()
      ).length;
      if (userUsage >= (offer.perUserLimit || 1)) {
        return res.status(400).json({
          success: false,
          valid: false,
          message: `You have already redeemed this offer the maximum allowed (${offer.perUserLimit || 1}) times.`
        });
      }
    } else if (offer.isNewUserOnly) {
      // Unauthenticated check
      // Allow preview but advise login
    }

    const subtotal = Number(cartSubtotal) || 0;
    if (subtotal < (offer.minimumOrderValue || 0)) {
      const diff = (offer.minimumOrderValue || 0) - subtotal;
      return res.status(400).json({
        success: false,
        valid: false,
        message: `This offer requires a minimum order of ₹${offer.minimumOrderValue}. Add ₹${diff} more to your cart to apply.`
      });
    }

    // Category applicability check
    if (offer.applicableCategories && offer.applicableCategories.length > 0) {
      const match = cartItems.some((item) => {
        const itemCategory = (item.food?.category || item.category || "").toLowerCase();
        return offer.applicableCategories.some((c) => c.toLowerCase() === itemCategory);
      });

      if (!match && cartItems.length > 0) {
        return res.status(400).json({
          success: false,
          valid: false,
          message: `Offer "${cleanCode}" is only applicable on ${offer.applicableCategories.join(", ")} items.`
        });
      }
    }

    // Restaurant applicability check
    if (offer.applicableRestaurants && offer.applicableRestaurants.length > 0 && restaurant) {
      const match = offer.applicableRestaurants.some(
        (r) => r.toLowerCase() === restaurant.toLowerCase()
      );
      if (!match) {
        return res.status(400).json({
          success: false,
          valid: false,
          message: `Offer "${cleanCode}" is not applicable to ${restaurant}.`
        });
      }
    }

    // Calculate real backend discount
    let discount = 0;
    switch (offer.discountType) {
      case "percentage": {
        const raw = Math.round(subtotal * (offer.discountValue / 100));
        discount = offer.maximumDiscount > 0 ? Math.min(raw, offer.maximumDiscount) : raw;
        break;
      }
      case "flat": {
        discount = Math.min(offer.discountValue, subtotal);
        break;
      }
      case "free_delivery": {
        discount = 40; // Delivery fee waived
        break;
      }
      case "wallet_bonus": {
        discount = offer.discountValue;
        break;
      }
      case "reward_multiplier": {
        discount = 0; // Handled in reward points calculation
        break;
      }
      default: {
        discount = 0;
      }
    }

    return res.status(200).json({
      success: true,
      valid: true,
      discount,
      offer: {
        _id: offer._id,
        code: offer.code,
        title: offer.title,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        maximumDiscount: offer.maximumDiscount,
        minimumOrderValue: offer.minimumOrderValue,
        category: offer.category
      },
      message: `🎉 Offer "${cleanCode}" applied successfully! You saved ₹${discount}.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save / Bookmark an Offer in User Profile
 * POST /api/offers/:id/save
 */
export const toggleSaveOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (!user.savedOffers) {
      user.savedOffers = [];
    }

    const index = user.savedOffers.findIndex((oId) => oId.toString() === id.toString());
    let isSaved = false;

    if (index > -1) {
      user.savedOffers.splice(index, 1);
      isSaved = false;
    } else {
      user.savedOffers.push(id);
      isSaved = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      isSaved,
      message: isSaved ? "Offer saved to your bookmarks! 🔖" : "Offer removed from bookmarks.",
      savedOffers: user.savedOffers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Create New Offer
 * POST /api/offers
 */
export const createOffer = async (req, res, next) => {
  try {
    const {
      title,
      subtitle,
      code,
      discountType,
      discountValue,
      minimumOrderValue,
      maximumDiscount,
      category,
      applicableCategories,
      applicableRestaurants,
      isNewUserOnly,
      startDate,
      expiryDate,
      usageLimit,
      perUserLimit,
      termsAndConditions,
      highlightTag,
      badgeColor,
      city
    } = req.body;

    if (!title || !code || discountValue === undefined || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Title, promo code, discount value, and expiry date are required."
      });
    }

    const existing = await Offer.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Offer with code "${code}" already exists.`
      });
    }

    const offer = await Offer.create({
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : "",
      code: code.toUpperCase().trim(),
      discountType: discountType || "percentage",
      discountValue: Number(discountValue),
      minimumOrderValue: Number(minimumOrderValue) || 0,
      maximumDiscount: Number(maximumDiscount) || 0,
      category: category || "food",
      applicableCategories: Array.isArray(applicableCategories) ? applicableCategories : [],
      applicableRestaurants: Array.isArray(applicableRestaurants) ? applicableRestaurants : [],
      isNewUserOnly: Boolean(isNewUserOnly),
      startDate: startDate ? new Date(startDate) : new Date(),
      expiryDate: new Date(expiryDate),
      usageLimit: Number(usageLimit) || 10000,
      perUserLimit: Number(perUserLimit) || 1,
      termsAndConditions: Array.isArray(termsAndConditions) ? termsAndConditions : [],
      highlightTag: highlightTag || "",
      badgeColor: badgeColor || "#ff5200",
      city: city || "All"
    });

    return res.status(201).json({
      success: true,
      message: "Offer created successfully.",
      offer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update Offer
 * PUT /api/offers/:id
 */
export const updateOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!offer) {
      return res.status(404).json({ success: false, message: "Offer not found." });
    }
    return res.status(200).json({
      success: true,
      message: "Offer updated successfully.",
      offer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Delete Offer
 * DELETE /api/offers/:id
 */
export const deleteOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: "Offer not found." });
    }
    return res.status(200).json({
      success: true,
      message: "Offer deleted successfully."
    });
  } catch (error) {
    next(error);
  }
};
