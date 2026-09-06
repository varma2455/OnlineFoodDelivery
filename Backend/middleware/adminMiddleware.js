/**
 * Admin Authorization Middleware
 * Allows access only to users with the "admin" role.
 */

export const isAdmin = (req, res, next) => {
    try {
        // User must already be authenticated using protect middleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Authorization failed.",
            error: error.message
        });
    }
};