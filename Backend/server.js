import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import fs from "fs";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import rewardRoutes from "./routes/rewardRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import membershipRoutes from "./routes/membershipRoutes.js";
import restaurantPartnerRoutes from "./routes/restaurantPartnerRoutes.js";
import deliveryPartnerRoutes from "./routes/deliveryPartnerRoutes.js";

import errorMiddleware from "./middleware/errorMiddleware.js";
import { provisionAllAdmins } from "./seed/adminSeeder.js";
import { seedOffers } from "./seed/offerSeeder.js";
import { seedRewards } from "./seed/rewardSeeder.js";
import { seedSupport } from "./seed/supportSeeder.js";

dotenv.config();

// Connect MongoDB
connectDB().then(() => {
    provisionAllAdmins().catch((err) => {
        console.warn("Initial admin bootstrap notice:", err.message);
    });
    seedOffers().catch((err) => {
        console.warn("Initial offer bootstrap notice:", err.message);
    });
    seedRewards().catch((err) => {
        console.warn("Initial reward bootstrap notice:", err.message);
    });
    seedSupport().catch((err) => {
        console.warn("Initial support bootstrap notice:", err.message);
    });
});

const app = express();

// Create uploads folder if missing
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Copy default placeholder images if available in assets
const pizzaAsset = path.join(process.cwd(), "../Frontend/src/assets/pizzas/margherita.jpg");
if (fs.existsSync(pizzaAsset) && !fs.existsSync(path.join(uploadsDir, "margherita.jpg"))) {
    try {
        fs.copyFileSync(pizzaAsset, path.join(uploadsDir, "margherita.jpg"));
    } catch (e) {}
}

// ==============================
// Middleware
// ==============================

app.use(cors({
    origin: (origin, callback) => {
        // Allow all local development origins and mobile/Postman
        callback(null, true);
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Static Folder for Uploaded Images
app.use("/uploads", express.static(uploadsDir));

// ==============================
// API Routes
// ==============================

app.use(["/api/auth", "/api/users", "/api/user"], authRoutes);
app.use(["/api/foods", "/api/food"], foodRoutes);
app.use(["/api/cart", "/api/carts"], cartRoutes);
app.use(["/api/orders", "/api/order"], orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/restaurant", restaurantRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use(["/api/wallet", "/api/wallets"], walletRoutes);
app.use(["/api/offers", "/api/offer"], offerRoutes);
app.use(["/api/rewards", "/api/reward"], rewardRoutes);
app.use(["/api/support", "/api/supports"], supportRoutes);
app.use(["/api/settings", "/api/setting"], settingsRoutes);
app.use(["/api/membership", "/api/memberships"], membershipRoutes);
app.use(["/api/restaurant-partner", "/api/restaurant-partners"], restaurantPartnerRoutes);
app.use(["/api/delivery-partner", "/api/delivery-partners"], deliveryPartnerRoutes);

// ==============================
// Health Check Route
// ==============================

app.get(["/", "/api/health"], (req, res) => {
    res.status(200).json({
        success: true,
        message: "🍔 FoodExpress API is Running Successfully"
    });
});

// ==============================
// 404 Route
// ==============================

app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `API Route Not Found: ${req.originalUrl}`
    });
});

// ==============================
// Global Error Middleware
// ==============================

app.use(errorMiddleware);

// ==============================
// Server
// ==============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
