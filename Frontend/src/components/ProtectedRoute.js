import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { StoreContext } from "../context/StoreContext";

/**
 * ProtectedRoute Component
 * Enforces authentication, account block status, and role-based permissions.
 */
const ProtectedRoute = ({ children, role, allowedRoles, requiredRole }) => {
    const location = useLocation();
    const { user, token, showToast } = useContext(StoreContext);

    // Fallback to localStorage if context is hydrating
    const storedToken = token || localStorage.getItem("token");
    let currentUser = user;
    if (!currentUser) {
        try {
            const saved = localStorage.getItem("user");
            if (saved) currentUser = JSON.parse(saved);
        } catch {
            currentUser = null;
        }
    }

    // 1. Not Authenticated -> Redirect to Login
    if (!storedToken || !currentUser) {
        return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
    }

    // 2. Account Blocked -> Deny Access
    if (currentUser.isBlocked) {
        if (showToast) {
            showToast("Your account has been blocked by an administrator.", "error");
        }
        return <Navigate to="/login" replace />;
    }

    // 3. Multi-Role Authorization Check
    const targetRoles = allowedRoles || (role ? [role] : []) || (requiredRole ? [requiredRole] : []);

    if (targetRoles.length > 0 && !targetRoles.includes(currentUser.role)) {
        if (showToast) {
            showToast(
                `Access Denied: Requires ${targetRoles.join(" or ")} role. (Current: ${currentUser.role})`,
                "error"
            );
        }

        // Redirect based on current user's rightful role
        if (currentUser.role === "admin") {
            return <Navigate to="/admin/dashboard" replace />;
        } else if (currentUser.role === "restaurant") {
            return <Navigate to="/restaurant" replace />;
        } else if (currentUser.role === "delivery") {
            return <Navigate to="/delivery" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;