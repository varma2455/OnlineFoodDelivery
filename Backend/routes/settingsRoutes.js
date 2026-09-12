import express from "express";
import {
    getSettings,
    updateAllSettings,
    updateAccountSettings,
    updatePrivacySettings,
    updateNotificationSettings,
    updateAppearanceSettings,
    updateAccessibilitySettings,
    updateOrderPreferences,
    updatePaymentSettings,
    toggleTwoFactor,
    logoutOtherSessions,
    downloadUserData,
    clearSearchHistory,
    clearRecentlyViewed,
    deactivateAccount,
    deleteAccount
} from "../controllers/settingsController.js";
import { changePassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Enforce strict authentication on all settings endpoints
router.use(protect);

// Main Settings
router.route("/")
    .get(getSettings)
    .put(updateAllSettings);

// Sub-sections
router.put("/account", updateAccountSettings);
router.put("/privacy", updatePrivacySettings);
router.put("/notifications", updateNotificationSettings);
router.put("/appearance", updateAppearanceSettings);
router.put("/accessibility", updateAccessibilitySettings);
router.put("/orders", updateOrderPreferences);
router.put("/payments", updatePaymentSettings);

// Security & Sessions
router.put("/change-password", changePassword);
router.post("/two-factor", toggleTwoFactor);
router.post("/sessions/logout-others", logoutOtherSessions);

// Data Management
router.get("/download-data", downloadUserData);
router.post("/clear-history", clearSearchHistory);
router.post("/clear-viewed", clearRecentlyViewed);

// Destructive Actions
router.post("/deactivate", deactivateAccount);
router.delete("/delete-account", deleteAccount);

export default router;
