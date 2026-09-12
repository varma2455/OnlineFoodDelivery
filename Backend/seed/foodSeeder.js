import mongoose from "mongoose";
import dotenv from "dotenv";
import Food from "../models/Food.js";
import User from "../models/User.js";
import connectDB from "../config/db.js";

dotenv.config();

await connectDB();

const foods = [
    // ==========================================
    // 1. BIRYANI
    // ==========================================
    {
        name: "Hyderabadi Chicken Dum Biryani",
        description: "Authentic slow-cooked dum biryani with marinated succulent chicken pieces, fragrant saffron basmati rice, served with mirchi ka salan and raita.",
        category: "Biryani",
        price: 349,
        discountPrice: 299,
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=900",
        isVeg: false,
        preparationTime: 30,
        stock: 45,
        rating: 4.9,
        totalReviews: 450,
        featured: true,
        isAvailable: true,
        restaurant: "Paradise Biryani",
        area: "Hyderabad",
        areas: ["Hyderabad", "Bhimavaram", "Bengaluru"]
    },
    {
        name: "Special Paneer Biryani",
        description: "Fragrant basmati rice layered with rich spices, caramelized onions, fresh mint and tender cottage cheese cubes.",
        category: "Biryani",
        price: 299,
        discountPrice: 269,
        image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=900",
        isVeg: true,
        preparationTime: 25,
        stock: 50,
        rating: 4.7,
        totalReviews: 280,
        featured: false,
        isAvailable: true,
        restaurant: "Biryani Blues",
        area: "Hyderabad",
        areas: ["Hyderabad", "Bhimavaram", "Mumbai"]
    },
    {
        name: "Bhimavaram Raju Gari Mutton Biryani",
        description: "Tender goat meat slow-simmered in rich Godavari spices and native ghee layered with long-grain basmati rice.",
        category: "Biryani",
        price: 449,
        discountPrice: 399,
        image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=900",
        isVeg: false,
        preparationTime: 35,
        stock: 35,
        rating: 4.9,
        totalReviews: 320,
        featured: true,
        isAvailable: true,
        restaurant: "Godavari Ruchulu",
        area: "Bhimavaram",
        areas: ["Bhimavaram", "Hyderabad"]
    },
    {
        name: "Ulavacharu Chicken Biryani",
        description: "Signature Andhra horsegram reduction blended with spiced aromatic biryani rice and tender chicken tikka chunks.",
        category: "Biryani",
        price: 379,
        discountPrice: 329,
        image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=900",
        isVeg: false,
        preparationTime: 28,
        stock: 40,
        rating: 4.8,
        totalReviews: 210,
        featured: true,
        isAvailable: true,
        restaurant: "Bhimavaram Anand Kitchen",
        area: "Bhimavaram",
        areas: ["Bhimavaram", "Hyderabad"]
    },
    {
        name: "Royal Egg Dum Biryani",
        description: "Golden fried farm-fresh boiled eggs enveloped in spiced dum masala and fluffy saffron basmati.",
        category: "Biryani",
        price: 249,
        discountPrice: 219,
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=900",
        isVeg: false,
        preparationTime: 20,
        stock: 60,
        rating: 4.6,
        totalReviews: 180,
        featured: false,
        isAvailable: true,
        restaurant: "Bawarchi Special",
        area: "Hyderabad",
        areas: ["Hyderabad", "Bhimavaram"]
    },

    // ==========================================
    // 2. PIZZA
    // ==========================================
    {
        name: "Farmhouse Pizza",
        description: "Fresh crunchy capsicum, sliced mushrooms, juicy tomatoes, and sliced black olives over melted mozzarella.",
        category: "Pizza",
        price: 299,
        discountPrice: 249,
        image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=900",
        isVeg: true,
        preparationTime: 25,
        stock: 50,
        rating: 4.8,
        totalReviews: 240,
        featured: true,
        isAvailable: true,
        restaurant: "Pizza Hut",
        area: "Hyderabad",
        areas: ["Hyderabad", "Bhimavaram", "Bengaluru"]
    },
    {
        name: "Margherita Pizza",
        description: "Classic Italian cheese pizza with rich herb tomato sauce, fresh mozzarella cheese and fragrant basil.",
        category: "Pizza",
        price: 199,
        discountPrice: 179,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=900",
        isVeg: true,
        preparationTime: 20,
        stock: 60,
        rating: 4.7,
        totalReviews: 210,
        featured: true,
        isAvailable: true,
        restaurant: "Domino's Pizza",
        area: "Hyderabad",
        areas: ["Hyderabad", "Bhimavaram", "Mumbai"]
    },
    {
        name: "Peppy Paneer Pizza",
        description: "Soft spiced paneer, juicy capsicum, and crispy red paprika loaded with gooey mozzarella on herb crust.",
        category: "Pizza",
        price: 349,
        discountPrice: 299,
        image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=900",
        isVeg: true,
        preparationTime: 25,
        stock: 45,
        rating: 4.9,
        totalReviews: 320,
        featured: true,
        isAvailable: true,
        restaurant: "La Pino'z Pizza",
        area: "Bhimavaram",
        areas: ["Bhimavaram", "Hyderabad"]
    },
    {
        name: "Chicken Tikka Pizza",
        description: "Tender tandoori chicken tikka chunks, sliced onions, and melted mozzarella cheese on freshly baked dough.",
        category: "Pizza",
        price: 399,
        discountPrice: 349,
        image: "https://images.unsplash.com/photo-1566843972142-a7fcb70de55a?w=900",
        isVeg: false,
        preparationTime: 30,
        stock: 40,
        rating: 4.6,
        totalReviews: 170,
        featured: true,
        isAvailable: true,
        restaurant: "Pizza Hut",
        area: "Hyderabad",
        areas: ["Hyderabad", "Bhimavaram"]
    },
    {
        name: "Godavari Peri Peri Veg Pizza",
        description: "Spicy peri-peri marinated cottage cheese, golden corn, sliced jalapeños and signature garlic butter crust.",
        category: "Pizza",
        price: 329,
        discountPrice: 289,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900",
        isVeg: true,
        preparationTime: 22,
        stock: 40,
        rating: 4.8,
        totalReviews: 195,
        featured: false,
        isAvailable: true,
        restaurant: "Bhimavaram Pizzeria",
        area: "Bhimavaram",
        areas: ["Bhimavaram", "Hyderabad"]
    },

    // ==========================================
    // 3. BURGER
    // ==========================================
    {
        name: "Crispy Chicken Burger",
        description: "Golden fried crispy chicken fillet topped with fresh lettuce, creamy mayo, and sweet dill pickles in a toasted sesame bun.",
        category: "Burger",
        price: 199,
        discountPrice: 179,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900",
        isVeg: false,
        preparationTime: 15,
        stock: 50,
        rating: 4.8,
        totalReviews: 180,
        featured: true,
        isAvailable: true,
        restaurant: "Burger King",
        area: "Hyderabad",
        areas: ["Hyderabad", "Bhimavaram", "Bengaluru"]
    },
    {
        name: "Double Cheese Burger",
        description: "Double grilled savory patty with melted cheddar cheese slice, caramelized onions, and secret house sauce.",
        category: "Burger",
        price: 249,
        discountPrice: 219,
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=900",
        isVeg: true,
        preparationTime: 15,
        stock: 55,
        rating: 4.7,
        totalReviews: 150,
        featured: true,
        isAvailable: true,
        restaurant: "McDonald's",
        area: "Hyderabad",
        areas: ["Hyderabad", "Bhimavaram"]
    },
    {
        name: "Supreme Veggie Burger",
        description: "Spiced crispy vegetable patty with creamy herb dressing, vine-ripened tomato, and crunchy iceberg lettuce.",
        category: "Burger",
        price: 179,
        discountPrice: 149,
        image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=900",
        isVeg: true,
        preparationTime: 15,
        stock: 60,
        rating: 4.6,
        totalReviews: 130,
        featured: false,
        isAvailable: true,
        restaurant: "Wow! Burger",
        area: "Bhimavaram",
        areas: ["Bhimavaram", "Hyderabad"]
    },
    {
        name: "Bhimavaram Crunchy Paneer Burger",
        description: "Cottage cheese patty crusted with crunchy panko crumbs, tandoori relish, sliced jalapeños and cheddar melt.",
        category: "Burger",
        price: 219,
        discountPrice: 189,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900",
        isVeg: true,
        preparationTime: 15,
        stock: 45,
        rating: 4.8,
        totalReviews: 160,
        featured: true,
        isAvailable: true,
        restaurant: "Godavari Ruchulu",
        area: "Bhimavaram",
        areas: ["Bhimavaram", "Hyderabad"]
    },

    // ==========================================
    // 4. FAST FOOD
    // ==========================================
    {
        name: "Crispy French Fries",
        description: "Golden crispy salted French fries served hot with tangy chipotle dip and tomato ketchup.",
        category: "Fast Food",
        price: 129,
        discountPrice: 99,
        image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=900",
        isVeg: true,
        preparationTime: 10,
        stock: 100,
        rating: 4.6,
        totalReviews: 220,
        featured: true,
        isAvailable: true,
        restaurant: "KFC",
        area: "Hyderabad",
        areas: ["Hyderabad", "Bhimavaram", "Bengaluru"]
    },
    {
        name: "Loaded Cheese Nachos",
        description: "Crunchy corn tortilla chips topped with melted jalapeño cheese, salsa picante, black olives and sour cream.",
        category: "Fast Food",
        price: 189,
        discountPrice: 159,
        image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=900",
        isVeg: true,
        preparationTime: 12,
        stock: 75,
        rating: 4.8,
        totalReviews: 190,
        featured: true,
        isAvailable: true,
        restaurant: "Taco Express",
        area: "Hyderabad",
        areas: ["Hyderabad", "Bhimavaram"]
    },
    {
        name: "Peri Peri Chicken Popcorn",
        description: "Bite-sized tender crispy chicken popcorn sprinkled with zesty peri peri seasonings and garlic mayo.",
        category: "Fast Food",
        price: 179,
        discountPrice: 149,
        image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=900",
        isVeg: false,
        preparationTime: 12,
        stock: 80,
        rating: 4.7,
        totalReviews: 250,
        featured: true,
        isAvailable: true,
        restaurant: "KFC",
        area: "Bhimavaram",
        areas: ["Bhimavaram", "Hyderabad"]
    },
    {
        name: "Godavari Mirchi Bajji Platter",
        description: "Crispy batter-fried Bhavnagri chillies stuffed with tangy peanut-onion filling and lemon chaat masala.",
        category: "Fast Food",
        price: 119,
        discountPrice: 99,
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=900",
        isVeg: true,
        preparationTime: 10,
        stock: 90,
        rating: 4.9,
        totalReviews: 310,
        featured: true,
        isAvailable: true,
        restaurant: "Godavari Ruchulu",
        area: "Bhimavaram",
        areas: ["Bhimavaram", "Hyderabad"]
    },

    // ==========================================
    // 5. DRINKS
    // ==========================================
    {
        name: "Cold Brew Coffee",
        description: "Artisanal smooth chilled dark roast coffee brewed for 16 hours with cream and vanilla essence.",
        category: "Drinks",
        price: 149,
        discountPrice: 129,
        image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=900",
        isVeg: true,
        preparationTime: 5,
        stock: 80,
        rating: 4.8,
        totalReviews: 160,
        featured: true,
        isAvailable: true,
        restaurant: "Starbucks",
        area: "Hyderabad",
        areas: ["Hyderabad", "Bhimavaram", "Bengaluru"]
    },
    {
        name: "Fresh Alphonso Mango Smoothie",
        description: "Sweet organic Alphonso mango pulp blended with rich chilled Greek yogurt and wildflower honey.",
        category: "Drinks",
        price: 139,
        discountPrice: 119,
        image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=900",
        isVeg: true,
        preparationTime: 5,
        stock: 70,
        rating: 4.9,
        totalReviews: 195,
        featured: true,
        isAvailable: true,
        restaurant: "Juice Lounge",
        area: "Bhimavaram",
        areas: ["Bhimavaram", "Hyderabad"]
    },
    {
        name: "Belgian Chocolate Thickshake",
        description: "Rich decadent Belgian cocoa blended with dairy cream, chocolate fudge swirl, and chocolate curls.",
        category: "Drinks",
        price: 189,
        discountPrice: 159,
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=900",
        isVeg: true,
        preparationTime: 6,
        stock: 65,
        rating: 4.9,
        totalReviews: 240,
        featured: false,
        isAvailable: true,
        restaurant: "The Thick Shake Factory",
        area: "Hyderabad",
        areas: ["Hyderabad", "Bhimavaram"]
    },
    {
        name: "Mint Lime Mojito Cooler",
        description: "Zesty crushed garden mint leaves, freshly squeezed key limes, sparkling soda, and cane syrup.",
        category: "Drinks",
        price: 119,
        discountPrice: 99,
        image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=900",
        isVeg: true,
        preparationTime: 5,
        stock: 90,
        rating: 4.7,
        totalReviews: 140,
        featured: false,
        isAvailable: true,
        restaurant: "Juice Lounge",
        area: "Bhimavaram",
        areas: ["Bhimavaram", "Hyderabad"]
    },

    // ==========================================
    // 6. DESSERTS
    // ==========================================
    {
        name: "Warm Chocolate Brownie",
        description: "Fudgy rich dark chocolate brownie served with molten chocolate drizzle and chocolate chips.",
        category: "Desserts",
        price: 169,
        discountPrice: 139,
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=900",
        isVeg: true,
        preparationTime: 8,
        stock: 60,
        rating: 4.9,
        totalReviews: 310,
        featured: true,
        isAvailable: true,
        restaurant: "Baskin Robbins",
        area: "Hyderabad",
        areas: ["Hyderabad", "Bhimavaram", "Bengaluru"]
    },
    {
        name: "New York Cheesecake",
        description: "Velvety smooth cream cheese baked on a crunchy buttery graham crust with strawberry coulis.",
        category: "Desserts",
        price: 219,
        discountPrice: 189,
        image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=900",
        isVeg: true,
        preparationTime: 5,
        stock: 40,
        rating: 4.8,
        totalReviews: 240,
        featured: true,
        isAvailable: true,
        restaurant: "Cheesecake Haven",
        area: "Hyderabad",
        areas: ["Hyderabad", "Bhimavaram"]
    },
    {
        name: "Gulab Jamun with Shahi Rabri",
        description: "Warm soft golden khoya dumplings soaked in saffron-rose cardamom syrup, paired with thickened rabri.",
        category: "Desserts",
        price: 159,
        discountPrice: 129,
        image: "https://images.unsplash.com/photo-1589119908995-c6837fa14d48?w=900",
        isVeg: true,
        preparationTime: 5,
        stock: 50,
        rating: 4.9,
        totalReviews: 280,
        featured: false,
        isAvailable: true,
        restaurant: "Karachi Bakery",
        area: "Bhimavaram",
        areas: ["Bhimavaram", "Hyderabad"]
    },
    {
        name: "Bhimavaram Special Pootharekulu",
        description: "Paper-thin rice starch wrappers layered with pure ghee, powdered dry fruits and organic jaggery.",
        category: "Desserts",
        price: 199,
        discountPrice: 169,
        image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=900",
        isVeg: true,
        preparationTime: 5,
        stock: 40,
        rating: 5.0,
        totalReviews: 390,
        featured: true,
        isAvailable: true,
        restaurant: "Godavari Sweets",
        area: "Bhimavaram",
        areas: ["Bhimavaram", "Hyderabad"]
    },

    // ==========================================
    // 7. NOODLES
    // ==========================================
    {
        name: "Hakka Noodles",
        description: "Wok-tossed noodles with shredded cabbage, carrots, bell peppers, scallions, and soy-garlic seasoning.",
        category: "Noodles",
        price: 219,
        discountPrice: 189,
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=900",
        isVeg: true,
        preparationTime: 18,
        stock: 55,
        rating: 4.7,
        totalReviews: 175,
        featured: true,
        isAvailable: true,
        restaurant: "Mainland China",
        area: "Hyderabad",
        areas: ["Hyderabad", "Bhimavaram", "Bengaluru"]
    },
    {
        name: "Schezwan Chicken Noodles",
        description: "Spicy wok-fried noodles with tender chicken strips, scallions, chili flakes and fiery schezwan paste.",
        category: "Noodles",
        price: 269,
        discountPrice: 239,
        image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=900",
        isVeg: false,
        preparationTime: 20,
        stock: 45,
        rating: 4.8,
        totalReviews: 210,
        featured: true,
        isAvailable: true,
        restaurant: "Wok Express",
        area: "Bhimavaram",
        areas: ["Bhimavaram", "Hyderabad"]
    },
    {
        name: "Singapore Chili Garlic Noodles",
        description: "Fragrant rice vermicelli and wheat noodles wok-tossed with curry aromatics, baby corn, and bell peppers.",
        category: "Noodles",
        price: 239,
        discountPrice: 209,
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900",
        isVeg: true,
        preparationTime: 18,
        stock: 50,
        rating: 4.6,
        totalReviews: 160,
        featured: false,
        isAvailable: true,
        restaurant: "Mainland China",
        area: "Hyderabad",
        areas: ["Hyderabad", "Bhimavaram"]
    },

    // ==========================================
    // 8. SALADS
    // ==========================================
    {
        name: "Greek Salad",
        description: "Crisp cucumbers, juicy cherry tomatoes, kalamata olives, bell peppers, and fresh feta cheese dressed in extra virgin olive oil.",
        category: "Salads",
        price: 199,
        discountPrice: 169,
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900",
        isVeg: true,
        preparationTime: 10,
        stock: 40,
        rating: 4.8,
        totalReviews: 120,
        featured: true,
        isAvailable: true,
        restaurant: "Salad Days",
        area: "Hyderabad",
        areas: ["Hyderabad", "Bhimavaram", "Bengaluru"]
    },
    {
        name: "Caesar Grilled Chicken Salad",
        description: "Crisp romaine hearts, sliced herb-grilled chicken breast, parmesan shavings, and house garlic croutons tossed in Caesar dressing.",
        category: "Salads",
        price: 249,
        discountPrice: 219,
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900",
        isVeg: false,
        preparationTime: 12,
        stock: 35,
        rating: 4.9,
        totalReviews: 155,
        featured: true,
        isAvailable: true,
        restaurant: "Green Table",
        area: "Hyderabad",
        areas: ["Hyderabad", "Bhimavaram"]
    },
    {
        name: "Crunchy Mediterranean Falafel Salad",
        description: "Crisp golden spiced falafels served over mixed greens, pickled red onion, cherry tomatoes, cucumbers and creamy tahini drizzle.",
        category: "Salads",
        price: 229,
        discountPrice: 199,
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900",
        isVeg: true,
        preparationTime: 12,
        stock: 40,
        rating: 4.7,
        totalReviews: 110,
        featured: false,
        isAvailable: true,
        restaurant: "Salad Days",
        area: "Bhimavaram",
        areas: ["Bhimavaram", "Hyderabad"]
    }
];

const seedSafe = async () => {
    try {
        console.log("🌱 Safely checking and upserting seed foods...");

        for (const item of foods) {
            await Food.updateOne(
                { name: item.name },
                { $set: item },
                { upsert: true }
            );
        }

        console.log(`✅ Upserted ${foods.length} food catalog items.`);

        // Seed default system users if they do not exist
        const defaultUsers = [
            {
                email: "admin@foodexpress.com",
                fullName: "Super Admin",
                phone: "9876543210",
                address: "HQ, FoodExpress Tech Park",
                city: "Hyderabad",
                role: "admin",
                password: "adminPassword123!",
                isVerified: true
            },
            {
                email: "restaurant@foodexpress.com",
                fullName: "Pizza Palace Manager",
                phone: "9876543211",
                address: "Sector 4, Main Market",
                city: "Hyderabad",
                role: "restaurant",
                password: "restaurantPassword123!",
                isVerified: true
            },
            {
                email: "delivery@foodexpress.com",
                fullName: "Ravi Kumar (Rider)",
                phone: "9876543212",
                address: "Station Road",
                city: "Hyderabad",
                role: "delivery",
                password: "deliveryPassword123!",
                isVerified: true
            },
            {
                email: "customer@foodexpress.com",
                fullName: "Rahul Sharma",
                phone: "9876543213",
                address: "Flat 402, Green Meadows",
                city: "Hyderabad",
                role: "customer",
                password: "customerPassword123!",
                isVerified: true,
                wallet: 250,
                rewardPoints: 120
            }
        ];

        for (const u of defaultUsers) {
            const exists = await User.findOne({ email: u.email });
            if (!exists) {
                await User.create(u);
                console.log(`👤 Created default user: ${u.email} (${u.role})`);
            }
        }

        console.log("✅ Database seeding completed safely without data loss.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedSafe();
