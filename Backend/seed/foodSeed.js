import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js";
import Food from "../models/Food.js";
import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

/**
 * FOODEXPRESS CANONICAL FOOD CATALOG (MINIMUM 5 ITEMS PER CATEGORY)
 * 8 Categories x 5 Items = 40 Foods Total
 *
 * Categories:
 * 1. Biryani
 * 2. Pizza
 * 3. Burger
 * 4. Fast Food
 * 5. Drinks
 * 6. Desserts
 * 7. Noodles
 * 8. Salads
 */
export const seedFoodsCatalog = [
    // =========================================================================
    // 1. BIRYANI (5 Items)
    // =========================================================================
    {
        name: "Chicken Dum Biryani",
        category: "Biryani",
        price: 280,
        discountPrice: 249,
        preparationTime: 30,
        stock: 50,
        isVeg: false,
        featured: true,
        isAvailable: true,
        rating: 4.9,
        totalReviews: 420,
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=900",
        description: "Fragrant long-grain basmati rice layered with tender marinated chicken, aromatic spices, and caramelized onions slow-cooked in traditional dum style.",
        restaurantSlug: "paradise-biryani"
    },
    {
        name: "Mutton Biryani",
        category: "Biryani",
        price: 360,
        discountPrice: 329,
        preparationTime: 40,
        stock: 35,
        isVeg: false,
        featured: true,
        isAvailable: true,
        rating: 4.8,
        totalReviews: 310,
        image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=900",
        description: "Tender succulently spiced mutton chunks slow-simmered with aged basmati rice, native desi ghee, fresh mint, and saffron infusion.",
        restaurantSlug: "paradise-biryani"
    },
    {
        name: "Chicken Fry Piece Biryani",
        category: "Biryani",
        price: 320,
        discountPrice: 289,
        preparationTime: 35,
        stock: 40,
        isVeg: false,
        featured: true,
        isAvailable: true,
        rating: 4.8,
        totalReviews: 280,
        image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=900",
        description: "Classic aromatic biryani rice served with crisp, spicy shallow-fried chicken pieces and fiery onion-curry leaf tempering.",
        restaurantSlug: "paradise-biryani"
    },
    {
        name: "Paneer Biryani",
        category: "Biryani",
        price: 260,
        discountPrice: 229,
        preparationTime: 25,
        stock: 30,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.7,
        totalReviews: 195,
        image: "https://images.unsplash.com/photo-1642821373181-696a54913e93?w=900",
        description: "Soft fresh cottage cheese cubes cooked in rich tandoori spices and layered with fragrant basmati, fried onions, and coriander.",
        restaurantSlug: "paradise-biryani"
    },
    {
        name: "Vegetable Biryani",
        category: "Biryani",
        price: 220,
        discountPrice: 199,
        preparationTime: 20,
        stock: 40,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.6,
        totalReviews: 150,
        image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=900",
        description: "Seasonal garden fresh vegetables, green peas, carrots, and beans cooked with saffron rice, whole spices, and kewra water.",
        restaurantSlug: "paradise-biryani"
    },

    // =========================================================================
    // 2. PIZZA (5 Items)
    // =========================================================================
    {
        name: "Margherita Pizza",
        category: "Pizza",
        price: 249,
        discountPrice: 219,
        preparationTime: 20,
        stock: 50,
        isVeg: true,
        featured: true,
        isAvailable: true,
        rating: 4.8,
        totalReviews: 380,
        image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=900",
        description: "Classic hand-tossed Italian pizza topped with crushed San Marzano tomato sauce, fresh mozzarella cheese, and aromatic basil leaves.",
        restaurantSlug: "slice-of-italy"
    },
    {
        name: "Farmhouse Pizza",
        category: "Pizza",
        price: 329,
        discountPrice: 289,
        preparationTime: 25,
        stock: 40,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.7,
        totalReviews: 240,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900",
        description: "Loaded with fresh crunchy bell peppers, sweet corn kernels, diced red onions, and button mushrooms on melted mozzarella.",
        restaurantSlug: "slice-of-italy"
    },
    {
        name: "Paneer Tikka Pizza",
        category: "Pizza",
        price: 349,
        discountPrice: 299,
        preparationTime: 25,
        stock: 35,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.8,
        totalReviews: 290,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=900",
        description: "Char-grilled spicy cottage cheese cubes, roasted capsicum, red onions, and tangy tandoori makhani sauce on crispy crust.",
        restaurantSlug: "slice-of-italy"
    },
    {
        name: "Chicken Tikka Pizza",
        category: "Pizza",
        price: 399,
        discountPrice: 349,
        preparationTime: 30,
        stock: 35,
        isVeg: false,
        featured: true,
        isAvailable: true,
        rating: 4.9,
        totalReviews: 410,
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900",
        description: "Smoky tandoori chicken tikka pieces, roasted red peppers, green bell peppers, and melted mozzarella over hand-rolled crust.",
        restaurantSlug: "slice-of-italy"
    },
    {
        name: "Double Cheese Pizza",
        category: "Pizza",
        price: 299,
        discountPrice: 269,
        preparationTime: 20,
        stock: 45,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.7,
        totalReviews: 220,
        image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=900",
        description: "Over-the-top indulgence featuring a thick foundation of mature orange cheddar topped with stretchy fresh mozzarella.",
        restaurantSlug: "slice-of-italy"
    },

    // =========================================================================
    // 3. BURGER (5 Items)
    // =========================================================================
    {
        name: "Classic Veg Burger",
        category: "Burger",
        price: 149,
        discountPrice: 129,
        preparationTime: 15,
        stock: 50,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.6,
        totalReviews: 190,
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=900",
        description: "Crispy seasoned vegetable and potato patty topped with crunchy iceberg lettuce, tomato slices, and creamy signature burger sauce.",
        restaurantSlug: "burger-lab"
    },
    {
        name: "Crispy Chicken Burger",
        category: "Burger",
        price: 219,
        discountPrice: 189,
        preparationTime: 20,
        stock: 45,
        isVeg: false,
        featured: true,
        isAvailable: true,
        rating: 4.9,
        totalReviews: 450,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900",
        description: "Extra-crunchy panko-crusted chicken breast fillet, pickled cucumber slices, melted cheddar, and smoked paprika garlic mayo.",
        restaurantSlug: "burger-lab"
    },
    {
        name: "Paneer Burger",
        category: "Burger",
        price: 189,
        discountPrice: 169,
        preparationTime: 18,
        stock: 35,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.7,
        totalReviews: 210,
        image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=900",
        description: "Generous slab of fresh cottage cheese coated in spicy cornflake crust, served with tandoori mayo and crunchy purple cabbage.",
        restaurantSlug: "burger-lab"
    },
    {
        name: "Double Cheese Chicken Burger",
        category: "Burger",
        price: 279,
        discountPrice: 249,
        preparationTime: 22,
        stock: 40,
        isVeg: false,
        featured: true,
        isAvailable: true,
        rating: 4.9,
        totalReviews: 380,
        image: "https://images.unsplash.com/photo-1586816001966-79b736744398?w=900",
        description: "Dual seasoned grilled chicken patties stacked with double melted yellow cheddar slices and rich barbecue relish on brioche.",
        restaurantSlug: "burger-lab"
    },
    {
        name: "Spicy Chicken Burger",
        category: "Burger",
        price: 239,
        discountPrice: 209,
        preparationTime: 18,
        stock: 40,
        isVeg: false,
        featured: false,
        isAvailable: true,
        rating: 4.8,
        totalReviews: 260,
        image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=900",
        description: "Spicy cayenne battered chicken thigh fillet with sliced jalapeños, fiery sriracha coleslaw, and pepper jack cheese.",
        restaurantSlug: "burger-lab"
    },

    // =========================================================================
    // 4. FAST FOOD (5 Items)
    // =========================================================================
    {
        name: "Chicken 65",
        category: "Fast Food",
        price: 249,
        discountPrice: 219,
        preparationTime: 25,
        stock: 40,
        isVeg: false,
        featured: true,
        isAvailable: true,
        rating: 4.9,
        totalReviews: 390,
        image: "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=900",
        description: "Fiery, crispy boneless chicken chunks marinated in ginger-garlic, crushed red chili paste, tempered with curry leaves and mustard.",
        restaurantSlug: "burger-lab"
    },
    {
        name: "Chicken Wings",
        category: "Fast Food",
        price: 269,
        discountPrice: 239,
        preparationTime: 20,
        stock: 35,
        isVeg: false,
        featured: false,
        isAvailable: true,
        rating: 4.8,
        totalReviews: 270,
        image: "https://images.unsplash.com/photo-1527477378375-efd37b9293ad?w=900",
        description: "Crispy fried golden chicken wings glazed with smoky barbecue honey sauce and garnished with roasted white sesame seeds.",
        restaurantSlug: "burger-lab"
    },
    {
        name: "French Fries",
        category: "Fast Food",
        price: 149,
        discountPrice: 129,
        preparationTime: 15,
        stock: 60,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.7,
        totalReviews: 310,
        image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=900",
        description: "Golden shoestring potato fries crispy on the outside and fluffy inside, dusted with sea salt and herbs, served with dip.",
        restaurantSlug: "burger-lab"
    },
    {
        name: "Veg Manchurian",
        category: "Fast Food",
        price: 199,
        discountPrice: 179,
        preparationTime: 20,
        stock: 45,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.6,
        totalReviews: 180,
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=900",
        description: "Crispy fried vegetable dumplings tossed in a wok with dark soy sauce, minced ginger, garlic, and fresh green spring onions.",
        restaurantSlug: "burger-lab"
    },
    {
        name: "Crispy Corn",
        category: "Fast Food",
        price: 179,
        discountPrice: 159,
        preparationTime: 15,
        stock: 50,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.7,
        totalReviews: 215,
        image: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=900",
        description: "Tender American sweet corn kernels tossed in seasoned batter, deep fried till crunchy, finished with chat masala and lime juice.",
        restaurantSlug: "burger-lab"
    },

    // =========================================================================
    // 5. DRINKS (5 Items)
    // =========================================================================
    {
        name: "Fresh Lime Soda",
        category: "Drinks",
        price: 99,
        discountPrice: 79,
        preparationTime: 5,
        stock: 60,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.7,
        totalReviews: 160,
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=900",
        description: "Refreshing fizzy soda blended with fresh lemon juice, crushed mint, rock salt, and sweet sugar syrup served over ice.",
        restaurantSlug: "dessert-oasis"
    },
    {
        name: "Mango Milkshake",
        category: "Drinks",
        price: 159,
        discountPrice: 139,
        preparationTime: 8,
        stock: 40,
        isVeg: true,
        featured: true,
        isAvailable: true,
        rating: 4.9,
        totalReviews: 340,
        image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=900",
        description: "Thick and creamy tropical shake crafted with sweet Alphonso mango pulp, fresh dairy milk, and a scoop of vanilla ice cream.",
        restaurantSlug: "dessert-oasis"
    },
    {
        name: "Chocolate Milkshake",
        category: "Drinks",
        price: 169,
        discountPrice: 149,
        preparationTime: 8,
        stock: 45,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.8,
        totalReviews: 290,
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=900",
        description: "Decadent dark Dutch cocoa syrup blended with chilled whole milk, topped with whipped cream and bittersweet chocolate curls.",
        restaurantSlug: "dessert-oasis"
    },
    {
        name: "Cold Coffee",
        category: "Drinks",
        price: 149,
        discountPrice: 129,
        preparationTime: 7,
        stock: 55,
        isVeg: true,
        featured: true,
        isAvailable: true,
        rating: 4.8,
        totalReviews: 320,
        image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=900",
        description: "Signature cold brewed espresso blended with rich chilled milk and vanilla essence, finished with chocolate fudge drizzle.",
        restaurantSlug: "dessert-oasis"
    },
    {
        name: "Fresh Orange Juice",
        category: "Drinks",
        price: 139,
        discountPrice: 119,
        preparationTime: 6,
        stock: 50,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.7,
        totalReviews: 180,
        image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=900",
        description: "100% freshly pressed Valencia orange juice with natural pulp, full of natural vitamins with zero added artificial preservatives.",
        restaurantSlug: "dessert-oasis"
    },

    // =========================================================================
    // 6. DESSERTS (5 Items)
    // =========================================================================
    {
        name: "Chocolate Brownie",
        category: "Desserts",
        price: 159,
        discountPrice: 139,
        preparationTime: 10,
        stock: 45,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.8,
        totalReviews: 290,
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=900",
        description: "Warm, rich and fudgy chocolate brownie packed with toasted walnuts and dark chocolate chips, served with chocolate drizzle.",
        restaurantSlug: "dessert-oasis"
    },
    {
        name: "Gulab Jamun",
        category: "Desserts",
        price: 119,
        discountPrice: 99,
        preparationTime: 8,
        stock: 50,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.7,
        totalReviews: 240,
        image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=900",
        description: "Traditional soft khoya milk dumplings fried to golden brown and immersed in warm saffron-cardamom sugar syrup.",
        restaurantSlug: "dessert-oasis"
    },
    {
        name: "Rasmalai",
        category: "Desserts",
        price: 149,
        discountPrice: 129,
        preparationTime: 8,
        stock: 35,
        isVeg: true,
        featured: true,
        isAvailable: true,
        rating: 4.9,
        totalReviews: 330,
        image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=900",
        description: "Delicate melt-in-mouth cottage cheese patties soaked in luscious saffron-pistachio thickened milk, served chilled.",
        restaurantSlug: "dessert-oasis"
    },
    {
        name: "Chocolate Lava Cake",
        category: "Desserts",
        price: 179,
        discountPrice: 159,
        preparationTime: 10,
        stock: 30,
        isVeg: true,
        featured: true,
        isAvailable: true,
        rating: 4.9,
        totalReviews: 410,
        image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=900",
        description: "Warm individual chocolate sponge cake with a decadent gooey center of molten dark Belgian chocolate that oozes upon cutting.",
        restaurantSlug: "dessert-oasis"
    },
    {
        name: "Vanilla Ice Cream",
        category: "Desserts",
        price: 99,
        discountPrice: 89,
        preparationTime: 5,
        stock: 55,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.6,
        totalReviews: 170,
        image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=900",
        description: "Smooth and creamy double-churned dairy ice cream infused with aromatic Madagascar vanilla beans, accompanied by a crisp waffle wafer.",
        restaurantSlug: "dessert-oasis"
    },

    // =========================================================================
    // 7. NOODLES (5 Items)
    // =========================================================================
    {
        name: "Veg Hakka Noodles",
        category: "Noodles",
        price: 189,
        discountPrice: 169,
        preparationTime: 15,
        stock: 45,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.7,
        totalReviews: 220,
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900",
        description: "Classic Indo-Chinese noodles wok-tossed on high flame with julienned cabbage, bell peppers, carrots, spring onions, and light soy.",
        restaurantSlug: "wok-express"
    },
    {
        name: "Chicken Hakka Noodles",
        category: "Noodles",
        price: 239,
        discountPrice: 209,
        preparationTime: 18,
        stock: 40,
        isVeg: false,
        featured: true,
        isAvailable: true,
        rating: 4.8,
        totalReviews: 360,
        image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=900",
        description: "Stir-fried egg noodles with seasoned chicken strips, fluffy scrambled egg, shredded vegetables, and zesty Asian seasonings.",
        restaurantSlug: "wok-express"
    },
    {
        name: "Schezwan Noodles",
        category: "Noodles",
        price: 209,
        discountPrice: 189,
        preparationTime: 16,
        stock: 35,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.7,
        totalReviews: 240,
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900",
        description: "Spicy and tangy noodles tossed with fiery house-made Schezwan chili garlic sauce, crunchy vegetables, and scallions.",
        restaurantSlug: "wok-express"
    },
    {
        name: "Paneer Noodles",
        category: "Noodles",
        price: 219,
        discountPrice: 199,
        preparationTime: 16,
        stock: 35,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.6,
        totalReviews: 185,
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=900",
        description: "Wok-tossed noodles generously tossed with golden pan-sautéed paneer cubes, crunchy red peppers, and savory soy garlic glaze.",
        restaurantSlug: "wok-express"
    },
    {
        name: "Singapore Noodles",
        category: "Noodles",
        price: 249,
        discountPrice: 229,
        preparationTime: 18,
        stock: 30,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.7,
        totalReviews: 175,
        image: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=900",
        description: "Delicate thin rice vermicelli seasoned with mild fragrant yellow curry powder, sesame oil, bell peppers, and fresh greens.",
        restaurantSlug: "wok-express"
    },

    // =========================================================================
    // 8. SALADS (5 Items)
    // =========================================================================
    {
        name: "Garden Fresh Salad",
        category: "Salads",
        price: 159,
        discountPrice: 139,
        preparationTime: 10,
        stock: 30,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.6,
        totalReviews: 140,
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900",
        description: "Crunchy romaine lettuce, tender English cucumbers, ripe cherry tomatoes, and shaved carrots dressed with cold-pressed lemon vinaigrette.",
        restaurantSlug: "wok-express"
    },
    {
        name: "Greek Salad",
        category: "Salads",
        price: 229,
        discountPrice: 199,
        preparationTime: 12,
        stock: 30,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.8,
        totalReviews: 210,
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900",
        description: "Plump Kalamata olives, diced cucumbers, ripe Roma tomatoes, red onion rings, and creamy feta cheese tossed in extra virgin olive oil.",
        restaurantSlug: "wok-express"
    },
    {
        name: "Paneer Tikka Salad",
        category: "Salads",
        price: 249,
        discountPrice: 219,
        preparationTime: 15,
        stock: 30,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.7,
        totalReviews: 190,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900",
        description: "Oven-roasted spiced paneer tikka cubes atop baby spinach, sweet bell peppers, and shredded red cabbage with a mint yogurt drizzle.",
        restaurantSlug: "wok-express"
    },
    {
        name: "Chicken Caesar Salad",
        category: "Salads",
        price: 299,
        discountPrice: 269,
        preparationTime: 15,
        stock: 25,
        isVeg: false,
        featured: true,
        isAvailable: true,
        rating: 4.9,
        totalReviews: 320,
        image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=900",
        description: "Herb-grilled sliced chicken breast, crisp romaine leaves, golden garlic croutons, and shaved parmesan with rich Caesar dressing.",
        restaurantSlug: "wok-express"
    },
    {
        name: "Corn & Veggie Salad",
        category: "Salads",
        price: 189,
        discountPrice: 169,
        preparationTime: 10,
        stock: 35,
        isVeg: true,
        featured: false,
        isAvailable: true,
        rating: 4.7,
        totalReviews: 165,
        image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=900",
        description: "Steamed sweet corn kernels, diced avocados, colorful bell peppers, cherry tomatoes, and fresh cilantro tossed with honey-lime dressing.",
        restaurantSlug: "wok-express"
    }
];

/**
 * Ensures required approved restaurants exist without duplicates
 */
async function getOrCreateRestaurants(ownerUser) {
    const ownerId = ownerUser._id;

    const defaultRestaurantsData = [
        {
            slug: "paradise-biryani",
            name: "Paradise Biryani House",
            description: "Authentic Hyderabadi Dum Biryanis, kebabs, and royal Mughlai curries.",
            email: "paradise@foodexpress.com",
            phone: "9876543201",
            address: { street: "Road No. 10, Banjara Hills", city: "Hyderabad", state: "Telangana", pincode: "500034" },
            cuisineTypes: ["Biryani", "North Indian", "Mughlai"],
            restaurantType: "Both",
            status: "approved",
            isActive: true,
            isOpen: true,
            rating: 4.9,
            totalReviews: 650,
            deliveryFee: 40,
            minimumOrderAmount: 150
        },
        {
            slug: "slice-of-italy",
            name: "Slice of Italy Pizzeria",
            description: "Artisanal hand-tossed woodfired pizzas, garlic breads, and Italian pastas.",
            email: "slice@foodexpress.com",
            phone: "9876543202",
            address: { street: "Jubilee Enclave, HITEC City", city: "Hyderabad", state: "Telangana", pincode: "500081" },
            cuisineTypes: ["Pizza", "Fast Food", "Italian"],
            restaurantType: "Both",
            status: "approved",
            isActive: true,
            isOpen: true,
            rating: 4.8,
            totalReviews: 480,
            deliveryFee: 35,
            minimumOrderAmount: 200
        },
        {
            slug: "burger-lab",
            name: "The Burger Lab & Snacks",
            description: "Juicy gourmet burgers, crispy chicken 65, wings, and golden loaded fries.",
            email: "burgerlab@foodexpress.com",
            phone: "9876543203",
            address: { street: "Main Road, Gachibowli", city: "Hyderabad", state: "Telangana", pincode: "500032" },
            cuisineTypes: ["Burger", "Fast Food", "American"],
            restaurantType: "Both",
            status: "approved",
            isActive: true,
            isOpen: true,
            rating: 4.8,
            totalReviews: 520,
            deliveryFee: 30,
            minimumOrderAmount: 120
        },
        {
            slug: "dessert-oasis",
            name: "Dessert Oasis & Chill Brews",
            description: "Warm molten brownies, artisan gulab jamun, rasmalai, cold brews, and creamy shakes.",
            email: "dessertoasis@foodexpress.com",
            phone: "9876543204",
            address: { street: "Near Tech Park, Madhapur", city: "Hyderabad", state: "Telangana", pincode: "500081" },
            cuisineTypes: ["Desserts", "Drinks", "Beverages"],
            restaurantType: "Veg",
            status: "approved",
            isActive: true,
            isOpen: true,
            rating: 4.9,
            totalReviews: 590,
            deliveryFee: 25,
            minimumOrderAmount: 100
        },
        {
            slug: "wok-express",
            name: "Wok Express & Green Bowls",
            description: "Fiery wok-tossed Hakka noodles, Schezwan specials, and crunchy fresh salads.",
            email: "wokexpress@foodexpress.com",
            phone: "9876543205",
            address: { street: "Cyber Towers Circle, HITEC City", city: "Hyderabad", state: "Telangana", pincode: "500081" },
            cuisineTypes: ["Noodles", "Salads", "Chinese"],
            restaurantType: "Both",
            status: "approved",
            isActive: true,
            isOpen: true,
            rating: 4.7,
            totalReviews: 380,
            deliveryFee: 30,
            minimumOrderAmount: 140
        }
    ];

    const restaurantMap = {};

    for (const restData of defaultRestaurantsData) {
        let restaurant = await Restaurant.findOne({ name: restData.name });
        if (!restaurant) {
            restaurant = await Restaurant.create({
                ...restData,
                ownerId
            });
            console.log(`🏪 [CREATED] Restaurant: "${restaurant.name}" (Approved)`);
        } else {
            // Ensure status is approved and open so foods are orderable
            if (restaurant.status !== "approved" || !restaurant.isOpen || !restaurant.isActive) {
                restaurant.status = "approved";
                restaurant.isActive = true;
                restaurant.isOpen = true;
                await restaurant.save();
            }
            console.log(`ℹ️ [EXISTS] Restaurant: "${restaurant.name}" (Preserved)`);
        }
        restaurantMap[restData.slug] = restaurant;
    }

    return restaurantMap;
}

/**
 * Main Idempotent Food Seeding Function
 */
export async function seedFoods() {
    try {
        console.log("\n==================================================");
        console.log("🌱 FOODEXPRESS IDEMPOTENT FOOD DATABASE SEEDER");
        console.log("==================================================");

        await connectDB();

        // 1. Find or create an owner user for restaurant relationship
        let ownerUser = await User.findOne({ role: "admin" }) || await User.findOne({ role: "restaurant" });
        if (!ownerUser) {
            ownerUser = await User.findOne({});
        }

        if (!ownerUser) {
            // Create a default administrator/kitchen manager user
            ownerUser = await User.create({
                email: "admin@foodexpress.com",
                fullName: "FoodExpress Super Admin",
                phone: "9876543210",
                address: "FoodExpress Headquarters, Tech Park",
                city: "Hyderabad",
                role: "admin",
                password: "AdminPassword123!",
                isVerified: true
            });
            console.log(`👤 [CREATED] Default Admin User: ${ownerUser.email}`);
        }

        // 2. Resolve or create restaurants without duplicates
        const restaurantMap = await getOrCreateRestaurants(ownerUser);
        const fallbackRestaurant = Object.values(restaurantMap)[0];

        // 3. Process each food item idempotently
        let insertedCount = 0;
        let skippedCount = 0;
        const categoryCounts = {};

        for (const item of seedFoodsCatalog) {
            categoryCounts[item.category] = (categoryCounts[item.category] || 0);

            // Check if food already exists by name
            const existingFood = await Food.findOne({ name: item.name });

            if (existingFood) {
                // DO NOT overwrite image or existing data
                console.log(`ℹ️ [SKIPPED] "${item.name}" already exists in "${existingFood.category}" — preserving image.`);
                skippedCount++;
            } else {
                // Assign restaurant relationship
                const targetRestaurant = restaurantMap[item.restaurantSlug] || fallbackRestaurant;

                await Food.create({
                    name: item.name,
                    description: item.description,
                    category: item.category,
                    price: item.price,
                    discountPrice: item.discountPrice,
                    preparationTime: item.preparationTime,
                    stock: item.stock,
                    isVeg: item.isVeg,
                    featured: item.featured,
                    isAvailable: item.isAvailable,
                    rating: item.rating,
                    totalReviews: item.totalReviews,
                    image: item.image,
                    restaurantId: targetRestaurant._id,
                    restaurant: targetRestaurant.name,
                    area: targetRestaurant.address?.city || "Hyderabad",
                    areas: ["Hyderabad", "Bhimavaram", "Bengaluru", "Mumbai"]
                });

                console.log(`✅ [INSERTED] "${item.name}" -> ${item.category} (₹${item.price}, Stock: ${item.stock})`);
                insertedCount++;
            }
        }

        // 4. Verification and Aggregation
        const totalFoods = await Food.countDocuments();
        const categoryAggregation = await Food.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const uniqueRestaurants = await Food.distinct("restaurantId");

        console.log("\n==================================================");
        console.log("🎉 FOOD SEED COMPLETED SUCCESSFULLY!");
        console.log("==================================================");
        console.log(`Categories Processed : 8`);
        console.log(`Minimum Required     : 40 foods (>= 5 per category)`);
        console.log(`Total Foods in DB    : ${totalFoods}`);
        console.log(`New Foods Inserted   : ${insertedCount}`);
        console.log(`Existing Preserved   : ${skippedCount}`);
        console.log(`Restaurants Linked   : ${uniqueRestaurants.length}`);
        console.log("--------------------------------------------------");
        console.log("Category Breakdown in Database:");
        categoryAggregation.forEach(c => {
            const pass = c.count >= 5 ? "✓ PASS" : "✗ BELOW 5";
            console.log(`  • ${c._id.padEnd(14)}: ${c.count} items (${pass})`);
        });
        console.log("==================================================\n");

        return {
            totalFoods,
            insertedCount,
            skippedCount,
            categoryAggregation,
            restaurantsUsed: uniqueRestaurants.length
        };
    } catch (error) {
        console.error("❌ Food seeding failed:", error);
        throw error;
    }
}

// Auto-execute if run directly via CLI (e.g. node seed/foodSeed.js)
if (process.argv[1] && process.argv[1].endsWith("foodSeed.js")) {
    seedFoods()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
