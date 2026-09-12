/**
 * Food Customization Configuration & Calculation Engine
 * Backend authoritative source of truth for categories, options, pricing, and validation.
 */

export const getDefaultCustomizationForCategory = (category = "", food = {}) => {
    const cat = (category || "").trim().toLowerCase();
    const basePrice = food?.discountPrice > 0 ? food.discountPrice : (food?.price || 299);

    // 1. PIZZA
    if (cat === "pizza" || cat.includes("pizza")) {
        return {
            category: "Pizza",
            sections: [
                {
                    id: "size",
                    title: "Choose Size",
                    type: "radio",
                    required: true,
                    field: "size",
                    options: [
                        { name: "Small", price: Math.max(0, -50), description: "Serves 1", isDefault: false },
                        { name: "Medium", price: 0, description: "Serves 2 (Most Popular)", isDefault: true },
                        { name: "Large", price: 100, description: "Serves 3-4", isDefault: false }
                    ]
                },
                {
                    id: "crust",
                    title: "Choose Your Crust",
                    type: "radio",
                    required: true,
                    field: "crust",
                    options: [
                        { name: "Classic Hand Tossed", price: 0, description: "Traditional fluffy crust", isDefault: true },
                        { name: "Cheese Burst", price: 60, description: "Loaded with melted mozzarella inside the crust", isDefault: false },
                        { name: "Thin Crust", price: 30, description: "Light, crispy & crunchy", isDefault: false },
                        { name: "Farmhouse Crust", price: 50, description: "Herb-infused golden baked edge", isDefault: false }
                    ]
                },
                {
                    id: "toppings",
                    title: "Extra Toppings",
                    type: "checkbox",
                    required: false,
                    field: "toppings",
                    options: [
                        { name: "Extra Cheese", price: 40 },
                        { name: "Jalapeno", price: 30 },
                        { name: "Mushroom", price: 40 },
                        { name: "Olives", price: 35 },
                        { name: "Capsicum", price: 30 },
                        { name: "Paneer", price: 50 }
                    ]
                },
                {
                    id: "extras",
                    title: "Extra Accompaniments",
                    type: "checkbox",
                    required: false,
                    field: "extras",
                    options: [
                        { name: "Garlic Dip", price: 30 },
                        { name: "Cheese Dip", price: 35 },
                        { name: "Oregano & Chilli Flakes Pack", price: 15 }
                    ]
                }
            ]
        };
    }

    // 2. BURGER
    if (cat === "burger" || cat.includes("burger")) {
        return {
            category: "Burger",
            sections: [
                {
                    id: "bun",
                    title: "Choose Your Bun",
                    type: "radio",
                    required: true,
                    field: "bun",
                    options: [
                        { name: "Classic Bun", price: 0, description: "Soft toasted golden bun", isDefault: true },
                        { name: "Sesame Bun", price: 20, description: "Topped with toasted white sesame", isDefault: false },
                        { name: "Whole Wheat Bun", price: 30, description: "Healthy fiber-rich multigrain bun", isDefault: false },
                        { name: "Brioche Bun", price: 40, description: "Rich butter-glazed artisan bun", isDefault: false }
                    ]
                },
                {
                    id: "size",
                    title: "Choose Patty Size",
                    type: "radio",
                    required: true,
                    field: "size",
                    options: [
                        { name: "Regular Single Patty", price: 0, description: "Standard juicy patty", isDefault: true },
                        { name: "Double Patty Delight", price: 80, description: "Extra flame-grilled patty", isDefault: false }
                    ]
                },
                {
                    id: "extras",
                    title: "Add Extras & Sauces",
                    type: "checkbox",
                    required: false,
                    field: "extras",
                    options: [
                        { name: "Extra Patty", price: 80 },
                        { name: "Extra Cheese Slice", price: 30 },
                        { name: "Fresh Lettuce", price: 15 },
                        { name: "Sliced Tomato", price: 15 },
                        { name: "Caramelized Onion", price: 15 },
                        { name: "Pickled Jalapeno", price: 25 },
                        { name: "Chef's Secret Sauce", price: 20 }
                    ]
                }
            ]
        };
    }

    // 3. BIRYANI
    if (cat === "biryani" || cat.includes("biryani")) {
        return {
            category: "Biryani",
            sections: [
                {
                    id: "portion",
                    title: "Choose Portion Size",
                    type: "radio",
                    required: true,
                    field: "portion",
                    options: [
                        { name: "Half Portion", price: -50, description: "Ideal for 1 light meal", isDefault: false },
                        { name: "Regular", price: 0, description: "Serves 1 generously with sherva", isDefault: true },
                        { name: "Large", price: 80, description: "Serves 2 with 2 eggs & extra pieces", isDefault: false },
                        { name: "Family Pack", price: 180, description: "Serves 3-4 with double gravy & raita", isDefault: false }
                    ]
                },
                {
                    id: "rice",
                    title: "Select Rice Preparation",
                    type: "radio",
                    required: true,
                    field: "rice",
                    options: [
                        { name: "Basmati Dum Rice", price: 0, description: "Aged fragrant long grain saffron basmati", isDefault: true },
                        { name: "Jeera Basmati Rice", price: 20, description: "Tempered with roasted cumin seeds", isDefault: false },
                        { name: "Brown Basmati Rice", price: 40, description: "Nutritious slow-steamed unpolished grain", isDefault: false }
                    ]
                },
                {
                    id: "spice",
                    title: "Select Spice Level",
                    type: "radio",
                    required: true,
                    field: "spice",
                    options: [
                        { name: "Mild", price: 0, description: "Subtle aroma, very gentle heat", isDefault: false },
                        { name: "Medium", price: 0, description: "Authentic Hyderabadi balanced spice", isDefault: true },
                        { name: "Spicy", price: 0, description: "High heat with green chillies & pepper", isDefault: false },
                        { name: "Extra Spicy", price: 10, description: "Fiery Guntur chilli punch", isDefault: false }
                    ]
                },
                {
                    id: "extras",
                    title: "Add Delicious Extras",
                    type: "checkbox",
                    required: false,
                    field: "extras",
                    options: [
                        { name: "Extra Raita", price: 30 },
                        { name: "Mirchi Ka Salan", price: 35 },
                        { name: "Boiled Egg (2 Pcs)", price: 20 },
                        { name: "Fresh Green Salad", price: 25 },
                        { name: "Extra Dum Rice", price: 60 }
                    ]
                }
            ]
        };
    }

    // 4. FAST FOOD / SNACKS
    if (cat === "fast food" || cat === "fastfood" || cat.includes("fast") || cat.includes("snack")) {
        return {
            category: "Fast Food",
            sections: [
                {
                    id: "size",
                    title: "Choose Size",
                    type: "radio",
                    required: true,
                    field: "size",
                    options: [
                        { name: "Small", price: -30, description: "Snack portion", isDefault: false },
                        { name: "Medium", price: 0, description: "Standard regular serving", isDefault: true },
                        { name: "Large", price: 50, description: "Jumbo shareable portion", isDefault: false }
                    ]
                },
                {
                    id: "spice",
                    title: "Select Seasoning / Spice",
                    type: "radio",
                    required: true,
                    field: "spice",
                    options: [
                        { name: "Mild Classic Salted", price: 0, description: "Crisp & lightly seasoned", isDefault: false },
                        { name: "Medium Peri Peri", price: 0, description: "Zesty Portuguese spice dust", isDefault: true },
                        { name: "Spicy Masala", price: 0, description: "Indian street style chaat masala", isDefault: false },
                        { name: "Extra Spicy Ghost Pepper", price: 10, description: "Extreme heat for spice lovers", isDefault: false }
                    ]
                },
                {
                    id: "extras",
                    title: "Select Dips & Extras",
                    type: "checkbox",
                    required: false,
                    field: "extras",
                    options: [
                        { name: "Liquid Cheese Dip", price: 30 },
                        { name: "Peri Peri Mayo", price: 20 },
                        { name: "Garlic Aioli", price: 20 },
                        { name: "Jalapeno Nacho Slices", price: 25 },
                        { name: "Extra Fries Portion", price: 60 }
                    ]
                }
            ]
        };
    }

    // 5. NOODLES / CHINESE
    if (cat === "noodles" || cat.includes("noodle") || cat === "chinese") {
        return {
            category: "Noodles",
            sections: [
                {
                    id: "noodlesType",
                    title: "Choose Noodles Variety",
                    type: "radio",
                    required: true,
                    field: "noodlesType",
                    options: [
                        { name: "Hakka Noodles", price: 0, description: "Wok-tossed classic thin noodles", isDefault: true },
                        { name: "Schezwan Noodles", price: 30, description: "Tossed in fiery red schezwan sauce", isDefault: false },
                        { name: "Chow Mein", price: 20, description: "Crispy pan-fried noodles with soya garlic", isDefault: false },
                        { name: "Flat Singapore Udon", price: 40, description: "Thick wheat noodles with curry aroma", isDefault: false }
                    ]
                },
                {
                    id: "spice",
                    title: "Spice Level",
                    type: "radio",
                    required: true,
                    field: "spice",
                    options: [
                        { name: "Mild", price: 0, description: "Low spice, aromatic garlic & scallions", isDefault: false },
                        { name: "Medium", price: 0, description: "Balanced oriental chilli pepper", isDefault: true },
                        { name: "Spicy", price: 0, description: "Hot dry red chilli flake kick", isDefault: false },
                        { name: "Extra Spicy", price: 10, description: "Sichuan peppercorn tongue-numbing heat", isDefault: false }
                    ]
                },
                {
                    id: "extras",
                    title: "Extra Add-ons & Proteins",
                    type: "checkbox",
                    required: false,
                    field: "extras",
                    options: [
                        { name: "Extra Crunchy Veggies", price: 30 },
                        { name: "Cottage Cheese (Paneer)", price: 45 },
                        { name: "Fried Egg Toss", price: 25 },
                        { name: "Chilli Chicken Chunks", price: 60 },
                        { name: "Chilli Garlic Sauce Cup", price: 20 }
                    ]
                }
            ]
        };
    }

    // 6. DRINKS / BEVERAGES
    if (cat === "drinks" || cat === "drink" || cat === "beverages" || cat.includes("beverage")) {
        return {
            category: "Drinks",
            sections: [
                {
                    id: "size",
                    title: "Choose Cup Size",
                    type: "radio",
                    required: true,
                    field: "size",
                    options: [
                        { name: "Small (250ml)", price: -20, description: "Single cup", isDefault: false },
                        { name: "Medium (400ml)", price: 0, description: "Standard regular cup", isDefault: true },
                        { name: "Large (600ml)", price: 40, description: "Grande tall cup", isDefault: false }
                    ]
                },
                {
                    id: "iceLevel",
                    title: "Select Ice Level",
                    type: "radio",
                    required: true,
                    field: "iceLevel",
                    options: [
                        { name: "No Ice", price: 0, description: "Chilled liquid, zero ice cubes", isDefault: false },
                        { name: "Less Ice", price: 0, description: "Light ice for maximum drink volume", isDefault: false },
                        { name: "Regular Ice", price: 0, description: "Perfect crisp chill", isDefault: true },
                        { name: "Extra Ice", price: 0, description: "Super frosty chill", isDefault: false }
                    ]
                },
                {
                    id: "sugarLevel",
                    title: "Select Sweetness Level",
                    type: "radio",
                    required: true,
                    field: "sugarLevel",
                    options: [
                        { name: "No Sugar (0%)", price: 0, description: "Unsweetened natural flavor", isDefault: false },
                        { name: "Less Sugar (50%)", price: 0, description: "Mildly sweet", isDefault: false },
                        { name: "Regular (100%)", price: 0, description: "Chef's ideal balanced sweetness", isDefault: true },
                        { name: "Extra Sweet (120%)", price: 10, description: "Extra cane sugar syrup", isDefault: false }
                    ]
                },
                {
                    id: "milkOption",
                    title: "Milk Option (Optional)",
                    type: "radio",
                    required: false,
                    field: "milkOption",
                    options: [
                        { name: "Regular Fresh Milk", price: 0, description: "Creamy whole dairy milk", isDefault: true },
                        { name: "Low Fat Milk", price: 15, description: "Light skimmed milk", isDefault: false },
                        { name: "Almond Milk", price: 35, description: "Plant-based roasted almond milk", isDefault: false },
                        { name: "Oat & Soy Milk", price: 30, description: "Silky vegan milk blend", isDefault: false }
                    ]
                },
                {
                    id: "topping",
                    title: "Select Gourmet Topping",
                    type: "radio",
                    required: false,
                    field: "topping",
                    options: [
                        { name: "No Topping", price: 0, isDefault: true },
                        { name: "Whipped Cream Swirl", price: 30, isDefault: false },
                        { name: "Dark Chocolate Drizzle", price: 20, isDefault: false },
                        { name: "Salted Caramel Swirl", price: 25, isDefault: false },
                        { name: "Chewy Tapioca Boba Pearls", price: 40, isDefault: false }
                    ]
                },
                {
                    id: "extras",
                    title: "Packaging Extras",
                    type: "checkbox",
                    required: false,
                    field: "extras",
                    options: [
                        { name: "Sealed Spill-Proof Lid", price: 0 },
                        { name: "Extra Paper Straw", price: 0 },
                        { name: "Insulated Cooling Sleeve", price: 15 }
                    ]
                }
            ]
        };
    }

    // 7. DESSERTS
    if (cat === "desserts" || cat === "dessert" || cat.includes("dessert")) {
        return {
            category: "Desserts",
            sections: [
                {
                    id: "portion",
                    title: "Choose Portion Size",
                    type: "radio",
                    required: true,
                    field: "portion",
                    options: [
                        { name: "Single Serving", price: 0, description: "Perfect for 1 person", isDefault: true },
                        { name: "Regular Double", price: 40, description: "Serves 2 sweet tooths", isDefault: false },
                        { name: "Large Sharing Bowl", price: 80, description: "Serves 3-4", isDefault: false },
                        { name: "Family Celebration Pack", price: 150, description: "Jumbo gift dessert box", isDefault: false }
                    ]
                },
                {
                    id: "topping",
                    title: "Choose Signature Topping",
                    type: "radio",
                    required: false,
                    field: "topping",
                    options: [
                        { name: "No Additional Topping", price: 0, isDefault: true },
                        { name: "Belgian Chocolate Fudge", price: 25, isDefault: false },
                        { name: "Salted Caramel Drizzle", price: 25, isDefault: false },
                        { name: "Roasted Almond & Cashew Crunch", price: 35, isDefault: false },
                        { name: "Rainbow Sprinkles", price: 15, isDefault: false },
                        { name: "Madagascar Vanilla Scoop", price: 40, isDefault: false }
                    ]
                },
                {
                    id: "extras",
                    title: "Extra Gourmet Add-ons",
                    type: "checkbox",
                    required: false,
                    field: "extras",
                    options: [
                        { name: "Warm Chocolate Lava Cup", price: 45 },
                        { name: "Extra Vanilla Ice Cream Scoop", price: 40 },
                        { name: "Crushed Brownie Chunks", price: 35 }
                    ]
                }
            ]
        };
    }

    // 8. SALADS
    if (cat === "salads" || cat === "salad" || cat.includes("salad")) {
        return {
            category: "Salads",
            sections: [
                {
                    id: "portion",
                    title: "Choose Bowl Size",
                    type: "radio",
                    required: true,
                    field: "portion",
                    options: [
                        { name: "Regular Fresh Bowl", price: 0, description: "Serves 1 as a crisp healthy meal", isDefault: true },
                        { name: "Large Meal Bowl", price: 70, description: "Double greens & protein portion", isDefault: false }
                    ]
                },
                {
                    id: "dressing",
                    title: "Choose Signature Dressing",
                    type: "radio",
                    required: true,
                    field: "dressing",
                    options: [
                        { name: "Classic Ranch", price: 0, description: "Cool buttermilk & herb dressing", isDefault: true },
                        { name: "Creamy Caesar", price: 0, description: "Garlic parmesan emulsion", isDefault: false },
                        { name: "Thousand Island", price: 0, description: "Tangy tomato & pickle cream", isDefault: false },
                        { name: "Mint Yogurt Dressing", price: 0, description: "Light probiotic mint dip", isDefault: false },
                        { name: "Extra Virgin Olive Oil & Lemon", price: 0, description: "Pure Mediterranean vinaigrette", isDefault: false },
                        { name: "No Dressing (Clean / Naked)", price: 0, description: "Natural unseasoned fresh greens", isDefault: false }
                    ]
                },
                {
                    id: "extras",
                    title: "Select Healthy Add-ins",
                    type: "checkbox",
                    required: false,
                    field: "extras",
                    options: [
                        { name: "Grilled Paneer Cubes", price: 40 },
                        { name: "Steamed Sweet Corn", price: 20 },
                        { name: "Kalamata Black Olives", price: 30 },
                        { name: "Crumbled Greek Feta", price: 45 },
                        { name: "Roasted Pumpkin & Chia Seeds", price: 35 },
                        { name: "Crispy Garlic Herb Croutons", price: 25 }
                    ]
                }
            ]
        };
    }

    // 9. UNIVERSAL FALLBACK (for South Indian, North Indian, Snacks, etc.)
    return {
        category: category || "General Food",
        sections: [
            {
                id: "portion",
                title: "Choose Portion Size",
                type: "radio",
                required: true,
                field: "portion",
                options: [
                    { name: "Regular", price: 0, description: "Standard serving", isDefault: true },
                    { name: "Large", price: 60, description: "Extra serving", isDefault: false }
                ]
            },
            {
                id: "spice",
                title: "Spice Preference",
                type: "radio",
                required: true,
                field: "spice",
                options: [
                    { name: "Mild", price: 0, isDefault: false },
                    { name: "Medium", price: 0, isDefault: true },
                    { name: "Spicy", price: 0, isDefault: false }
                ]
            },
            {
                id: "extras",
                title: "Optional Add-ons",
                type: "checkbox",
                required: false,
                field: "extras",
                options: [
                    { name: "Extra Chutney / Sauce", price: 20 },
                    { name: "Special House Salad", price: 25 },
                    { name: "Crispy Papad / Wafers", price: 15 }
                ]
            }
        ]
    };
};

/**
 * Validates the incoming customization payload against the food item,
 * verifies required choices, available options, and calculates the exact authoritative price.
 */
export const validateAndCalculateCustomization = (food, rawCustomization = {}) => {
    if (!food) {
        return { isValid: false, message: "Food item does not exist." };
    }

    // Determine config: use food's explicit customizationOptions if present, else category defaults
    const config = (food.customizationOptions && food.customizationOptions.sections?.length > 0)
        ? food.customizationOptions
        : getDefaultCustomizationForCategory(food.category, food);

    const basePrice = food.discountPrice && food.discountPrice > 0 ? food.discountPrice : food.price;
    let extraCharges = 0;

    // Standardize client payload into the exact 15 required fields
    const sanitized = {
        size: rawCustomization.size || null,
        quantity: Math.max(1, Number(rawCustomization.quantity) || 1),
        crust: rawCustomization.crust || null,
        toppings: Array.isArray(rawCustomization.toppings) ? rawCustomization.toppings : [],
        bun: rawCustomization.bun || null,
        rice: rawCustomization.rice || null,
        spice: rawCustomization.spice || null,
        noodlesType: rawCustomization.noodlesType || null,
        dressing: rawCustomization.dressing || null,
        iceLevel: rawCustomization.iceLevel || null,
        sugarLevel: rawCustomization.sugarLevel || null,
        milkOption: rawCustomization.milkOption || null,
        portion: rawCustomization.portion || null,
        topping: rawCustomization.topping || null,
        extras: Array.isArray(rawCustomization.extras) ? rawCustomization.extras : []
    };

    // Iterate through configured sections to validate and tally prices
    for (const section of config.sections || []) {
        const fieldName = section.field;
        const selectedValue = sanitized[fieldName];

        if (section.type === "radio") {
            if (!selectedValue) {
                const defaultOpt = section.options?.find((opt) => opt.isDefault) || section.options?.[0];
                if (defaultOpt) {
                    sanitized[fieldName] = defaultOpt.name;
                    extraCharges += Number(defaultOpt.price) || 0;
                } else if (section.required) {
                    return {
                        isValid: false,
                        message: `Please select an option for "${section.title}".`
                    };
                }
            } else {
                // Find matching option in configuration
                const match = section.options.find(
                    (opt) => opt.name.toLowerCase() === selectedValue.toLowerCase()
                );

                if (!match && section.required) {
                    return {
                        isValid: false,
                        message: `Option "${selectedValue}" is not a valid choice for "${section.title}".`
                    };
                }

                if (match) {
                    extraCharges += Number(match.price) || 0;
                    // Standardize casing
                    sanitized[fieldName] = match.name;
                }
            }
        } else if (section.type === "checkbox") {
            const selectedList = Array.isArray(selectedValue) ? selectedValue : [];

            if (section.required && selectedList.length === 0) {
                return {
                    isValid: false,
                    message: `Please choose at least one option for "${section.title}".`
                };
            }

            const cleanList = [];
            for (const item of selectedList) {
                const itemName = typeof item === "string" ? item : (item?.name || "");
                const match = section.options.find(
                    (opt) => opt.name.toLowerCase() === itemName.toLowerCase()
                );
                if (match) {
                    extraCharges += Number(match.price) || 0;
                    cleanList.push(match.name);
                }
            }
            sanitized[fieldName] = cleanList;
        }
    }

    const calculatedUnitPrice = Math.max(1, basePrice + extraCharges);

    return {
        isValid: true,
        unitPrice: calculatedUnitPrice,
        sanitizedCustomization: sanitized
    };
};
