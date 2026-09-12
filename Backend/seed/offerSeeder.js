import Offer from "../models/Offer.js";

export const seedOffers = async () => {
  try {
    const existingCount = await Offer.countDocuments();
    if (existingCount > 0) {
      // Offers already seeded
      return;
    }

    const now = new Date();
    const inDays = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

    const initialOffers = [
      {
        title: "50% OFF Food Orders",
        subtitle: "Get 50% off on your delicious food orders across top menus",
        code: "FOOD50",
        discountType: "percentage",
        discountValue: 50,
        minimumOrderValue: 299,
        maximumDiscount: 100,
        category: "food",
        applicableCategories: [],
        applicableRestaurants: [],
        isNewUserOnly: false,
        startDate: inDays(-1),
        expiryDate: inDays(30),
        usageLimit: 10000,
        perUserLimit: 3,
        highlightTag: "🔥 50% OFF",
        badgeColor: "#ff5200",
        city: "All",
        termsAndConditions: [
          "Valid on all food orders with cart subtotal of ₹299 or more.",
          "Maximum discount is capped at ₹100 per order.",
          "Can be used up to 3 times per user account.",
          "Cannot be combined with another promo code on the same order."
        ]
      },
      {
        title: "30% OFF on First Order",
        subtitle: "Welcome to FoodExpress! Enjoy 30% off on your debut food order",
        code: "FIRST30",
        discountType: "percentage",
        discountValue: 30,
        minimumOrderValue: 199,
        maximumDiscount: 200,
        category: "new_user",
        applicableCategories: [],
        applicableRestaurants: [],
        isNewUserOnly: true,
        startDate: inDays(-5),
        expiryDate: inDays(60),
        usageLimit: 50000,
        perUserLimit: 1,
        highlightTag: "🎉 NEW USER",
        badgeColor: "#10b981",
        city: "All",
        termsAndConditions: [
          "Exclusively valid for new FoodExpress users on their first order.",
          "Minimum order value of ₹199 required.",
          "Maximum discount capped at ₹200.",
          "Valid for 60 days from account creation."
        ]
      },
      {
        title: "₹150 OFF Welcome Feast",
        subtitle: "Flat ₹150 OFF on your first grand feast from any restaurant",
        code: "WELCOME150",
        discountType: "flat",
        discountValue: 150,
        minimumOrderValue: 399,
        maximumDiscount: 150,
        category: "new_user",
        applicableCategories: [],
        applicableRestaurants: [],
        isNewUserOnly: true,
        startDate: inDays(-2),
        expiryDate: inDays(60),
        usageLimit: 20000,
        perUserLimit: 1,
        highlightTag: "✨ WELCOME",
        badgeColor: "#ec4899",
        city: "All",
        termsAndConditions: [
          "Valid only for customers placing their first order.",
          "Cart subtotal must be at least ₹399 before discount.",
          "Flat ₹150 deducted immediately at checkout."
        ]
      },
      {
        title: "30% OFF Royal Biryani",
        subtitle: "Authentic Hyderabadi Dum, Zafrani & Special Biryani feast",
        code: "BIRYANI30",
        discountType: "percentage",
        discountValue: 30,
        minimumOrderValue: 249,
        maximumDiscount: 120,
        category: "food",
        applicableCategories: ["Biryani"],
        applicableRestaurants: [],
        isNewUserOnly: false,
        startDate: inDays(-1),
        expiryDate: inDays(45),
        usageLimit: 5000,
        perUserLimit: 5,
        highlightTag: "🍲 BIRYANI FEST",
        badgeColor: "#f59e0b",
        city: "Hyderabad",
        termsAndConditions: [
          "Applicable only when cart contains dishes from the Biryani category.",
          "Minimum order value ₹249.",
          "Maximum discount ₹120 per order."
        ]
      },
      {
        title: "40% OFF Gourmet Pizzas",
        subtitle: "Wood-fired crusts, cheese burst & authentic Italian toppings",
        code: "PIZZA40",
        discountType: "percentage",
        discountValue: 40,
        minimumOrderValue: 349,
        maximumDiscount: 160,
        category: "food",
        applicableCategories: ["Pizza"],
        applicableRestaurants: [],
        isNewUserOnly: false,
        startDate: inDays(-3),
        expiryDate: inDays(45),
        usageLimit: 5000,
        perUserLimit: 3,
        highlightTag: "🍕 PIZZA CRAZE",
        badgeColor: "#ef4444",
        city: "All",
        termsAndConditions: [
          "Applicable on all Pizza category items.",
          "Minimum cart subtotal ₹349.",
          "Maximum discount ₹160."
        ]
      },
      {
        title: "₹100 OFF Juicy Burgers",
        subtitle: "Double patty smash burgers, crispy chicken & fries combo",
        code: "BURGER100",
        discountType: "flat",
        discountValue: 100,
        minimumOrderValue: 499,
        maximumDiscount: 100,
        category: "food",
        applicableCategories: ["Burger", "Burgers"],
        applicableRestaurants: [],
        isNewUserOnly: false,
        startDate: inDays(-1),
        expiryDate: inDays(45),
        usageLimit: 5000,
        perUserLimit: 2,
        highlightTag: "🍔 BURGER BONANZA",
        badgeColor: "#8b5cf6",
        city: "All",
        termsAndConditions: [
          "Valid on all Burger category orders above ₹499.",
          "Flat ₹100 instant discount applied at checkout."
        ]
      },
      {
        title: "FREE DELIVERY Special",
        subtitle: "Zero delivery fees on all delicious meals to your doorstep",
        code: "FREEDEL",
        discountType: "free_delivery",
        discountValue: 40,
        minimumOrderValue: 199,
        maximumDiscount: 40,
        category: "delivery",
        applicableCategories: [],
        applicableRestaurants: [],
        isNewUserOnly: false,
        startDate: inDays(-10),
        expiryDate: inDays(30),
        usageLimit: 25000,
        perUserLimit: 10,
        highlightTag: "🚀 FREE DELIVERY",
        badgeColor: "#06b6d4",
        city: "All",
        termsAndConditions: [
          "Standard delivery charge of ₹40 is waived completely.",
          "Minimum order value ₹199.",
          "Applicable for all deliveries across supported cities."
        ]
      },
      {
        title: "20% OFF Selected Restaurants",
        subtitle: "Top-rated partner kitchens and premium culinary hubs",
        code: "RESTO20",
        discountType: "percentage",
        discountValue: 20,
        minimumOrderValue: 399,
        maximumDiscount: 150,
        category: "restaurants",
        applicableCategories: [],
        applicableRestaurants: [],
        isNewUserOnly: false,
        startDate: inDays(-2),
        expiryDate: inDays(30),
        usageLimit: 10000,
        perUserLimit: 5,
        highlightTag: "⭐ RESTAURANT SPECIAL",
        badgeColor: "#059669",
        city: "All",
        termsAndConditions: [
          "Valid on selected partner restaurants.",
          "Minimum order value ₹399.",
          "Maximum discount ₹150."
        ]
      },
      {
        title: "Add ₹500 & Get ₹50 Bonus",
        subtitle: "Top up your FoodExpress Wallet and get ₹50 extra instant credit",
        code: "WALLET50",
        discountType: "wallet_bonus",
        discountValue: 50,
        minimumOrderValue: 500,
        maximumDiscount: 50,
        category: "wallet",
        applicableCategories: [],
        applicableRestaurants: [],
        isNewUserOnly: false,
        startDate: inDays(-5),
        expiryDate: inDays(30),
        usageLimit: 5000,
        perUserLimit: 1,
        highlightTag: "💳 WALLET BONUS",
        badgeColor: "#3b82f6",
        city: "All",
        termsAndConditions: [
          "Add ₹500 or more to FoodExpress Wallet in a single top-up.",
          "Instant ₹50 bonus added to wallet balance.",
          "Usable across all restaurant orders."
        ]
      },
      {
        title: "Earn 2X Reward Points",
        subtitle: "Double loyalty points on all food orders this season",
        code: "REWARD2X",
        discountType: "reward_multiplier",
        discountValue: 2,
        minimumOrderValue: 299,
        maximumDiscount: 0,
        category: "rewards",
        applicableCategories: [],
        applicableRestaurants: [],
        isNewUserOnly: false,
        startDate: inDays(-2),
        expiryDate: inDays(30),
        usageLimit: 20000,
        perUserLimit: 10,
        highlightTag: "🏆 2X REWARDS",
        badgeColor: "#d97706",
        city: "All",
        termsAndConditions: [
          "Earn 20% of order value in FoodExpress Reward Points instead of 10%.",
          "Minimum order value ₹299.",
          "Points credited automatically upon order delivery."
        ]
      },
      {
        title: "Flash 60% OFF - Limited Hours",
        subtitle: "Lightning deal on evening orders! Hurry before time runs out",
        code: "FLASH60",
        discountType: "percentage",
        discountValue: 60,
        minimumOrderValue: 249,
        maximumDiscount: 120,
        category: "limited_time",
        applicableCategories: [],
        applicableRestaurants: [],
        isNewUserOnly: false,
        startDate: inDays(-1),
        expiryDate: inDays(2), // Expiring in 2 days (Ending soon)
        usageLimit: 500,
        perUserLimit: 1,
        highlightTag: "⚡ ENDING SOON",
        badgeColor: "#dc2626",
        city: "All",
        termsAndConditions: [
          "Flash sale offer expires in 48 hours.",
          "Minimum order subtotal ₹249.",
          "Maximum discount ₹120.",
          "Limited to first 500 redemptions."
        ]
      },
      {
        title: "Midnight Craving 25% OFF",
        subtitle: "Late night hunger resolved with 25% instant discount",
        code: "MIDNIGHT25",
        discountType: "percentage",
        discountValue: 25,
        minimumOrderValue: 299,
        maximumDiscount: 100,
        category: "limited_time",
        applicableCategories: [],
        applicableRestaurants: [],
        isNewUserOnly: false,
        startDate: inDays(-2),
        expiryDate: inDays(3), // Expiring in 3 days (Ending soon)
        usageLimit: 1500,
        perUserLimit: 2,
        highlightTag: "🌙 MIDNIGHT DEAL",
        badgeColor: "#6366f1",
        city: "All",
        termsAndConditions: [
          "Valid on orders placed between 10:00 PM and 4:00 AM.",
          "Minimum order value ₹299.",
          "Maximum discount ₹100."
        ]
      }
    ];

    await Offer.insertMany(initialOffers);
    console.log(`✅ Successfully seeded ${initialOffers.length} production FoodExpress offers!`);
  } catch (error) {
    console.warn("Offer seeder notice:", error.message);
  }
};
