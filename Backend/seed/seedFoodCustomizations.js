import mongoose from "mongoose";
import dotenv from "dotenv";
import Food from "../models/Food.js";
import { getDefaultCustomizationForCategory } from "../utils/customizationConfig.js";

dotenv.config();

const seedCustomizations = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for customization seeding...");

        const foods = await Food.find({});
        console.log(`Found ${foods.length} foods to inspect/update...`);

        let updatedCount = 0;
        for (const food of foods) {
            // Generate category-tailored customization configuration
            const config = getDefaultCustomizationForCategory(food.category, food);

            // Add restaurant-specific flair if appropriate
            const rest = (food.restaurant || "").toLowerCase();
            if (food.category === "Pizza") {
                if (rest.includes("domino")) {
                    const crustSec = config.sections.find(s => s.id === "crust");
                    if (crustSec) {
                        crustSec.options = [
                            { name: "New Hand Tossed", price: 0, description: "Classic Domino's crust", isDefault: true },
                            { name: "Cheese Burst", price: 60, description: "Loaded with creamy liquid cheese", isDefault: false },
                            { name: "Fresh Pan Crust", price: 40, description: "Thick & buttery pan crust", isDefault: false },
                            { name: "Wheat Thin Crust", price: 30, description: "Crisp light whole wheat base", isDefault: false }
                        ];
                    }
                } else if (rest.includes("pizza hut")) {
                    const crustSec = config.sections.find(s => s.id === "crust");
                    if (crustSec) {
                        crustSec.options = [
                            { name: "Pan Crust", price: 0, description: "Signature golden pan crust", isDefault: true },
                            { name: "Stuffed Crust (Cheese Maxx)", price: 65, description: "Mozzarella oozing from the crust ring", isDefault: false },
                            { name: "Thin 'N' Crispy", price: 30, description: "Super crunchy wafer crust", isDefault: false }
                        ];
                    }
                }
            } else if (food.category === "Biryani") {
                if (rest.includes("paradise")) {
                    const riceSec = config.sections.find(s => s.id === "rice");
                    if (riceSec) {
                        riceSec.options = [
                            { name: "Royal Dum Basmati", price: 0, description: "Aged long-grain saffron basmati", isDefault: true },
                            { name: "Double Masala Basmati", price: 30, description: "Extra spicy dum rice coating", isDefault: false }
                        ];
                    }
                }
            }

            food.customizationOptions = config;
            await food.save();
            updatedCount++;
        }

        console.log(`Successfully updated ${updatedCount} foods with rich customization options!`);
        await mongoose.disconnect();
    } catch (err) {
        console.error("Error seeding customizations:", err);
        process.exit(1);
    }
};

seedCustomizations();
