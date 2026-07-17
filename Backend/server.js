import errorMiddleware from "./middleware/errorMiddleware.js";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// ==============================
// Middleware
// ==============================

app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://online-food-delivery-gray.vercel.app"
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Static Folder for Uploaded Images
app.use("/uploads", express.static("uploads"));

// ==============================
// API Routes
// ==============================

app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);


// ==============================
// Home Route
// ==============================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "🍔 Online Food Delivery API is Running Successfully"
    });
});

// ==============================
// 404 Route
// ==============================

app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API Route Not Found"
    });
});

// ==============================
// Server
// ==============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});