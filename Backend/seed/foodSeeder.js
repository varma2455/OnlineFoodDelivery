import mongoose from "mongoose";
import dotenv from "dotenv";

import Food from "../models/Food.js";
import connectDB from "../config/db.js";

dotenv.config();

await connectDB();

const foods = [
    {
        name: "Margherita Pizza",
        description: "Classic cheese pizza with fresh mozzarella.",
        category: "Pizza",
        price: 299,
        discountPrice: 249,
        image: "margherita.jpg",
        isVeg: true,
        preparationTime: 20,
        stock: 100,
        rating: 4.8,
        totalReviews: 150,
        featured: true,
        isAvailable: true,
        restaurant: "Online Food Delivery"
    },
    {
        name: "Chicken Burger",
        description: "Juicy grilled chicken burger.",
        category: "Burger",
        price: 199,
        discountPrice: 179,
        image: "burger.jpg",
        isVeg: false,
        preparationTime: 15,
        stock: 100,
        rating: 4.6,
        totalReviews: 120,
        featured: true,
        isAvailable: true,
        restaurant: "Online Food Delivery"
    },
    {
        name: "Hyderabadi Biryani",
        description: "Authentic dum biryani with spices.",
        category: "Biryani",
        price: 349,
        discountPrice: 299,
        image: "biryani.jpg",
        isVeg: false,
        preparationTime: 30,
        stock: 100,
        rating: 4.9,
        totalReviews: 280,
        featured: true,
        isAvailable: true,
        restaurant: "Online Food Delivery"
    },
    {
        name: "French Fries",
        description: "Crispy golden fries.",
        category: "Snacks",
        price: 129,
        discountPrice: 99,
        image: "fries.jpg",
        isVeg: true,
        preparationTime: 10,
        stock: 100,
        rating: 4.5,
        totalReviews: 95,
        featured: false,
        isAvailable: true,
        restaurant: "Online Food Delivery"
    },
    {
        name: "Chocolate Brownie",
        description: "Rich chocolate brownie served warm.",
        category: "Desserts",
        price: 149,
        discountPrice: 129,
        image: "brownie.jpg",
        isVeg: true,
        preparationTime: 10,
        stock: 100,
        rating: 4.7,
        totalReviews: 110,
        featured: true,
        isAvailable: true,
        restaurant: "Online Food Delivery"
    }
];

const seedDatabase = async () => {
    try {

        await Food.deleteMany();

        await Food.insertMany(foods);

        console.log("✅ Food database seeded successfully.");

        process.exit();

    } catch (error) {

        console.error(error);

        process.exit(1);
    }
};

seedDatabase();