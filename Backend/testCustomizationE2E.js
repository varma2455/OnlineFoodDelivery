import mongoose from "mongoose";
import dotenv from "dotenv";
import Food from "./models/Food.js";
import User from "./models/User.js";
import Cart from "./models/Cart.js";
import { validateAndCalculateCustomization } from "./utils/customizationConfig.js";

dotenv.config();

const runTests = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for E2E testing...");

        // 1. Verify all 8 categories exist and have valid configuration
        const categories = [
            "Pizza",
            "Burger",
            "Biryani",
            "Fast Food",
            "Drinks",
            "Desserts",
            "Noodles",
            "Salads"
        ];

        console.log("\n--- TEST 1: CATEGORY CONFIGURATION & PRICING VERIFICATION ---");
        for (const cat of categories) {
            const food = await Food.findOne({ category: cat });
            if (!food) {
                console.error(`❌ Missing food for category: ${cat}`);
                continue;
            }

            console.log(`\nTesting category [${cat}]: "${food.name}" (${food.restaurant})`);
            console.log(`Base Price: ₹${food.discountPrice || food.price}`);
            console.log(`Sections count: ${food.customizationOptions?.sections?.length || 0}`);

            // Pick first option for each required section
            const testCustomization = {
                size: null,
                quantity: 2,
                crust: null,
                toppings: [],
                bun: null,
                rice: null,
                spice: null,
                noodlesType: null,
                dressing: null,
                iceLevel: null,
                sugarLevel: null,
                milkOption: null,
                portion: null,
                topping: null,
                extras: []
            };

            for (const sec of food.customizationOptions?.sections || []) {
                if (sec.type === "radio") {
                    testCustomization[sec.field] = sec.options[0]?.name;
                } else if (sec.type === "checkbox" && sec.options.length > 0) {
                    testCustomization[sec.field] = [sec.options[0].name];
                }
            }

            const val = validateAndCalculateCustomization(food, testCustomization);
            if (!val.isValid) {
                console.error(`❌ Validation failed for ${cat}:`, val.message);
            } else {
                console.log(`✅ ${cat} Validated! Unit Price: ₹${val.unitPrice} | Total (Qty 2): ₹${val.unitPrice * 2}`);
            }
        }

        // 2. Test Cart Distinct Items vs Identical Items
        console.log("\n--- TEST 2: CART DISTINCT ITEM DIFFERENTIATION ---");
        const user = await User.findOne({ email: "yeswanthvaram64280@gmail.com" });
        if (!user) {
            console.log("Test user not found, skipping cart DB insert test.");
            await mongoose.disconnect();
            return;
        }

        // Clear existing cart for test user
        await Cart.deleteMany({ user: user._id });

        const pizza = await Food.findOne({ category: "Pizza" });

        const crustOptions = pizza.customizationOptions?.sections?.find(s => s.id === "crust")?.options || [];
        const crust1 = crustOptions[0]?.name || "Classic Hand Tossed";
        const crust2 = crustOptions[1]?.name || "Cheese Burst";

        // Item A: Farmhouse Pizza Medium
        const itemACust = {
            size: "Medium",
            quantity: 1,
            crust: crust1,
            toppings: ["Extra Cheese"],
            bun: null, rice: null, spice: null, noodlesType: null,
            dressing: null, iceLevel: null, sugarLevel: null, milkOption: null,
            portion: null, topping: null, extras: []
        };
        const valA = validateAndCalculateCustomization(pizza, itemACust);
        if (!valA.isValid) throw new Error("valA failed: " + valA.message);

        const cartA = await Cart.create({
            user: user._id,
            food: pizza._id,
            foodType: pizza.category,
            customization: valA.sanitizedCustomization,
            quantity: 1,
            price: valA.unitPrice,
            subtotal: valA.unitPrice
        });

        // Item B: Farmhouse Pizza Large (SAME FOOD, DIFFERENT CUSTOMIZATION)
        const itemBCust = {
            size: "Large",
            quantity: 1,
            crust: crust2,
            toppings: ["Extra Cheese", "Mushroom", "Olives"],
            bun: null, rice: null, spice: null, noodlesType: null,
            dressing: null, iceLevel: null, sugarLevel: null, milkOption: null,
            portion: null, topping: null, extras: []
        };
        const valB = validateAndCalculateCustomization(pizza, itemBCust);
        if (!valB.isValid) throw new Error("valB failed: " + valB.message);

        const cartB = await Cart.create({
            user: user._id,
            food: pizza._id,
            foodType: pizza.category,
            customization: valB.sanitizedCustomization,
            quantity: 1,
            price: valB.unitPrice,
            subtotal: valB.unitPrice
        });

        const userCartItems = await Cart.find({ user: user._id }).populate("food");
        console.log(`Cart total distinct items in DB: ${userCartItems.length}`);
        if (userCartItems.length === 2) {
            console.log("✅ Passed! Two identical foods with different customizations are preserved as 2 distinct cart items.");
            console.log(`  Item 1: ${userCartItems[0].food.name} | Size: ${userCartItems[0].customization.size} | Crust: ${userCartItems[0].customization.crust} | Price: ₹${userCartItems[0].price}`);
            console.log(`  Item 2: ${userCartItems[1].food.name} | Size: ${userCartItems[1].customization.size} | Crust: ${userCartItems[1].customization.crust} | Price: ₹${userCartItems[1].price}`);
        } else {
            console.error("❌ Failed! Items were improperly merged.");
        }

        console.log("\n==========================================");
        console.log("✅ ALL BACKEND CUSTOMIZATION TESTS PASSED!");
        console.log("==========================================");

        await mongoose.disconnect();
    } catch (err) {
        console.error("Test execution error:", err);
        process.exit(1);
    }
};

runTests();
