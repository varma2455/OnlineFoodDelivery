/**
 * Role-Based Access Control Middleware
 * Requires that the authenticated user has one of the specified roles.
 * User role is strictly retrieved from the database.
 */
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        if (req.user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked by an administrator."
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(" or ")}. Your role: ${req.user.role}`
            });
        }

        next();
    };
};

export const authorize = requireRole;
export default requireRole;