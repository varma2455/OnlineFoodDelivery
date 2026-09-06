/**
 * Global Error Handler
 */

const errorMiddleware = (err, req, res, next) => {
    console.error("==================================");
    console.error("❌ Error:", err.message);
    console.error("==================================");

    // Default Error
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // MongoDB Invalid ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource ID.";
    }

    // Duplicate Key Error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists.`;
    }

    // Mongoose Validation Error
    if (err.name === "ValidationError") {
        statusCode = 400;

        message = Object.values(err.errors)
            .map((item) => item.message)
            .join(", ");
    }

    // JWT Errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid authentication token.";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Authentication token has expired.";
    }

    // Multer Errors
    if (err.name === "MulterError") {
        statusCode = 400;
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        message,
        stack:
            process.env.NODE_ENV === "development"
                ? err.stack
                : undefined,
    });
};

export default errorMiddleware;