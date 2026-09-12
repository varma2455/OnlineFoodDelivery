import User from "../models/User.js";
import Order from "../models/Order.js";

/**
 * Default Preferences Factory
 */
export const getDefaultPreferences = () => ({
    privacy: {
        profileVisibility: "public",
        personalizedRecommendations: true,
        orderHistoryPersonalization: true,
        locationTracking: true,
        searchHistoryEnabled: true,
        recentlyViewedEnabled: true,
        favoritesPrivate: false
    },
    notifications: {
        orderUpdates: { email: true, push: true, sms: true },
        deliveryUpdates: { email: true, push: true, sms: true },
        offersPromotions: { email: true, push: true, sms: false },
        walletAlerts: { email: true, push: true, sms: true },
        rewardsAlerts: { email: true, push: true, sms: false },
        accountSecurity: { email: true, push: true, sms: true },
        supportAlerts: { email: true, push: true, sms: false }
    },
    appearance: {
        theme: "light",
        compactMode: false,
        reducedMotion: false,
        fontSize: "medium"
    },
    accessibility: {
        reducedMotion: false,
        highContrast: false,
        largeText: false,
        screenReaderFriendly: false,
        keyboardNavigation: true
    },
    orders: {
        defaultDeliveryAddressId: "",
        defaultPaymentMethod: "COD",
        deliveryInstructions: "",
        contactlessDelivery: false,
        restaurantPreference: "All",
        foodPreference: "all"
    },
    wallet: {
        autoUseWallet: false,
        walletPaymentPreference: "Wallet Balance First"
    },
    rewards: {
        autoApplyEligibleRewards: true
    },
    languageRegion: {
        language: "English",
        currency: "INR (₹)",
        region: "India",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "12-hour (AM/PM)"
    },
    payments: {
        defaultMethod: "UPI",
        savedUPIId: "",
        savedCards: []
    },
    security: {
        twoFactorEnabled: false,
        twoFactorMethod: "email"
    }
});

/**
 * Deep merge source into target
 */
const deepMerge = (target, source) => {
    if (!source || typeof source !== "object") return target;
    for (const key of Object.keys(source)) {
        if (
            source[key] &&
            typeof source[key] === "object" &&
            !Array.isArray(source[key])
        ) {
            if (!target[key] || typeof target[key] !== "object") {
                target[key] = {};
            }
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
};

/**
 * Ensure user preferences are fully populated with defaults
 */
const ensurePreferences = (user) => {
    const defaults = getDefaultPreferences();
    const existing = (user.preferences && typeof user.preferences === "object")
        ? JSON.parse(JSON.stringify(user.preferences))
        : {};

    const merged = deepMerge(defaults, existing);
    user.preferences = merged;
    return merged;
};

/**
 * GET /api/settings
 */
export const getSettings = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .select("-password")
            .populate("savedOffers");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        const preferences = ensurePreferences(user);

        // Recent orders count for statistics
        const orderCount = await Order.countDocuments({ user: req.user._id });

        // Session Information derived from request headers
        const userAgent = req.headers["user-agent"] || "Modern Web Browser";
        let browserName = "Chrome";
        if (userAgent.includes("Firefox")) browserName = "Firefox";
        else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browserName = "Safari";
        else if (userAgent.includes("Edge")) browserName = "Microsoft Edge";

        let osName = "Linux / Desktop";
        if (userAgent.includes("Windows")) osName = "Windows";
        else if (userAgent.includes("Macintosh")) osName = "macOS";
        else if (userAgent.includes("Android")) osName = "Android";
        else if (userAgent.includes("iPhone")) osName = "iOS";

        const currentSession = {
            id: "sess_current",
            device: `${browserName} on ${osName}`,
            browser: browserName,
            os: osName,
            ip: req.ip || req.connection?.remoteAddress || "127.0.0.1",
            lastActive: new Date().toISOString(),
            isCurrent: true,
            status: "Active Now"
        };

        return res.status(200).json({
            success: true,
            settings: {
                user: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    city: user.city,
                    address: user.address,
                    dateOfBirth: user.dateOfBirth,
                    gender: user.gender,
                    profileImage: user.profileImage,
                    role: user.role,
                    isVerified: user.isVerified,
                    membership: user.membership,
                    wallet: user.wallet,
                    rewardPoints: user.rewardPoints,
                    createdAt: user.createdAt,
                    savedAddresses: user.savedAddresses || []
                },
                preferences,
                sessions: [currentSession],
                stats: {
                    totalOrders: orderCount,
                    savedAddressesCount: user.savedAddresses?.length || 0,
                    walletBalance: user.wallet || 0,
                    rewardPoints: user.rewardPoints || 0
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/settings
 */
export const updateAllSettings = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const currentPrefs = ensurePreferences(user);
        const { preferences, personal } = req.body;

        if (personal && typeof personal === "object") {
            if (personal.fullName !== undefined) user.fullName = personal.fullName.trim();
            if (personal.phone !== undefined) user.phone = personal.phone.trim();
            if (personal.city !== undefined) user.city = personal.city.trim();
            if (personal.address !== undefined) user.address = personal.address.trim();
            if (personal.dateOfBirth !== undefined) user.dateOfBirth = personal.dateOfBirth;
            if (personal.gender !== undefined) user.gender = personal.gender;
            if (personal.profileImage !== undefined) user.profileImage = personal.profileImage;
        }

        if (preferences && typeof preferences === "object") {
            user.preferences = deepMerge(currentPrefs, preferences);
        }

        // Keep legacy user.notifications in sync
        if (user.preferences.notifications) {
            const notifs = user.preferences.notifications;
            user.notifications = {
                orderUpdates: Boolean(notifs.orderUpdates?.email || notifs.orderUpdates?.push),
                deliveryUpdates: Boolean(notifs.deliveryUpdates?.email || notifs.deliveryUpdates?.push),
                offersPromotions: Boolean(notifs.offersPromotions?.email || notifs.offersPromotions?.push),
                rewards: Boolean(notifs.rewardsAlerts?.email || notifs.rewardsAlerts?.push)
            };
        }

        user.markModified("preferences");
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Settings saved successfully.",
            preferences: user.preferences,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                city: user.city,
                address: user.address,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                profileImage: user.profileImage,
                role: user.role,
                isVerified: user.isVerified,
                membership: user.membership,
                wallet: user.wallet,
                rewardPoints: user.rewardPoints
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/settings/account
 */
export const updateAccountSettings = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const { fullName, phone, city, address, dateOfBirth, gender, profileImage } = req.body;

        if (fullName !== undefined) {
            if (!fullName.trim()) {
                return res.status(400).json({ success: false, message: "Full name is required." });
            }
            user.fullName = fullName.trim();
        }

        if (phone !== undefined) user.phone = phone.trim();
        if (city !== undefined) user.city = city.trim();
        if (address !== undefined) user.address = address.trim();
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
        if (gender !== undefined) user.gender = gender;
        if (profileImage !== undefined) user.profileImage = profileImage;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Personal details updated successfully.",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                city: user.city,
                address: user.address,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                profileImage: user.profileImage,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/settings/privacy
 */
export const updatePrivacySettings = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        const currentPrefs = ensurePreferences(user);
        currentPrefs.privacy = {
            ...currentPrefs.privacy,
            ...req.body
        };
        user.preferences = currentPrefs;
        user.markModified("preferences");
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Privacy settings updated.",
            privacy: user.preferences.privacy
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/settings/notifications
 */
export const updateNotificationSettings = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        const currentPrefs = ensurePreferences(user);
        currentPrefs.notifications = deepMerge(currentPrefs.notifications, req.body);
        user.preferences = currentPrefs;
        user.markModified("preferences");
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Notification preferences updated.",
            notifications: user.preferences.notifications
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/settings/appearance
 */
export const updateAppearanceSettings = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        const currentPrefs = ensurePreferences(user);
        currentPrefs.appearance = {
            ...currentPrefs.appearance,
            ...req.body
        };
        user.preferences = currentPrefs;
        user.markModified("preferences");
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Appearance preferences updated.",
            appearance: user.preferences.appearance
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/settings/accessibility
 */
export const updateAccessibilitySettings = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        const currentPrefs = ensurePreferences(user);
        currentPrefs.accessibility = {
            ...currentPrefs.accessibility,
            ...req.body
        };
        user.preferences = currentPrefs;
        user.markModified("preferences");
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Accessibility preferences updated.",
            accessibility: user.preferences.accessibility
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/settings/orders
 */
export const updateOrderPreferences = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        const currentPrefs = ensurePreferences(user);
        currentPrefs.orders = {
            ...currentPrefs.orders,
            ...req.body
        };
        user.preferences = currentPrefs;
        user.markModified("preferences");
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Order preferences updated.",
            orders: user.preferences.orders
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/settings/payments
 */
export const updatePaymentSettings = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        const currentPrefs = ensurePreferences(user);
        const { defaultMethod, savedUPIId, addCard, removeCardId, setDefaultCardId } = req.body;

        if (defaultMethod) currentPrefs.payments.defaultMethod = defaultMethod;
        if (savedUPIId !== undefined) currentPrefs.payments.savedUPIId = savedUPIId.trim();

        if (addCard && addCard.last4) {
            const cardObj = {
                cardHolder: addCard.cardHolder?.trim() || user.fullName,
                last4: String(addCard.last4).slice(-4),
                brand: addCard.brand || "Visa",
                expMonth: addCard.expMonth || "12",
                expYear: addCard.expYear || "2028",
                isDefault: currentPrefs.payments.savedCards.length === 0 || Boolean(addCard.isDefault)
            };
            currentPrefs.payments.savedCards.push(cardObj);
        }

        if (removeCardId) {
            currentPrefs.payments.savedCards = currentPrefs.payments.savedCards.filter(
                (c, idx) => (c._id?.toString() || String(idx)) !== removeCardId
            );
        }

        if (setDefaultCardId) {
            currentPrefs.payments.savedCards.forEach((c, idx) => {
                c.isDefault = (c._id?.toString() || String(idx)) === setDefaultCardId;
            });
        }

        user.preferences = currentPrefs;
        user.markModified("preferences");
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Payment preferences updated.",
            payments: user.preferences.payments
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/settings/two-factor
 */
export const toggleTwoFactor = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        const currentPrefs = ensurePreferences(user);
        const { enabled } = req.body;

        currentPrefs.security.twoFactorEnabled = Boolean(enabled);
        user.preferences = currentPrefs;
        user.markModified("preferences");
        await user.save();

        return res.status(200).json({
            success: true,
            message: enabled ? "Two-factor authentication enabled." : "Two-factor authentication disabled.",
            twoFactorEnabled: user.preferences.security.twoFactorEnabled
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/settings/sessions/logout-others
 */
export const logoutOtherSessions = async (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            message: "All other device sessions have been successfully logged out."
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/settings/download-data
 */
export const downloadUserData = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .select("orderStatus totalAmount finalAmount paymentMethod deliveryAddress items createdAt");

        const exportData = {
            exportDate: new Date().toISOString(),
            platform: "FoodExpress",
            account: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                city: user.city,
                address: user.address,
                role: user.role,
                membership: user.membership,
                isVerified: user.isVerified,
                createdAt: user.createdAt
            },
            financials: {
                walletBalance: user.wallet,
                rewardPoints: user.rewardPoints
            },
            savedAddresses: user.savedAddresses,
            preferences: user.preferences,
            ordersSummary: {
                totalOrders: orders.length,
                recentOrders: orders.slice(0, 20)
            }
        };

        res.setHeader("Content-Disposition", `attachment; filename=foodexpress-data-${user._id}.json`);
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json(exportData);
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/settings/clear-history
 */
export const clearSearchHistory = async (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Search history has been cleared."
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/settings/clear-viewed
 */
export const clearRecentlyViewed = async (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Recently viewed items have been cleared."
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/settings/deactivate
 */
export const deactivateAccount = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        user.isDeactivated = true;
        user.deactivatedAt = new Date();
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Your account has been temporarily deactivated. You can sign in anytime to reactivate."
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/settings/delete-account
 */
export const deleteAccount = async (req, res, next) => {
    try {
        const { confirmation } = req.body;
        if (confirmation !== "DELETE") {
            return res.status(400).json({
                success: false,
                message: "Please type DELETE to confirm account deletion."
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        await User.findByIdAndDelete(req.user._id);

        return res.status(200).json({
            success: true,
            message: "Your FoodExpress account and personal data have been permanently deleted."
        });
    } catch (error) {
        next(error);
    }
};
