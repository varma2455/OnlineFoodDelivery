import fs from "fs";
import path from "path";
import Food from "../models/Food.js";
import Review from "../models/Review.js";
import { getDefaultCustomizationForCategory } from "../utils/customizationConfig.js";

/**
 * Add New Food
 * POST /api/foods
 */
export const addFood = async (req, res, next) => {
    try {
        const {
            name,
            description,
            category,
            price,
            discountPrice,
            isVeg,
            preparationTime,
            stock,
            featured,
            restaurant,
            image: bodyImage
        } = req.body;

        if (!name || !description || !category || !price) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields (name, description, category, price)."
            });
        }

        const image = req.file ? req.file.filename : (bodyImage || "margherita.jpg");

        const food = await Food.create({
            name: name.trim(),
            description: description.trim(),
            category: category.trim(),
            price: Number(price),
            discountPrice: discountPrice ? Number(discountPrice) : 0,
            image,
            isVeg: isVeg === "false" || isVeg === false ? false : true,
            preparationTime: preparationTime ? Number(preparationTime) : 20,
            stock: stock !== undefined ? Number(stock) : 100,
            featured: featured === "true" || featured === true ? true : false,
            restaurant: restaurant ? restaurant.trim() : "FoodExpress Kitchen",
            area: req.body.area ? req.body.area.trim() : "Hyderabad",
            areas: req.body.areas ? (Array.isArray(req.body.areas) ? req.body.areas : [req.body.areas]) : ["Hyderabad", "Bhimavaram"],
            isAvailable: true
        });

        return res.status(201).json({
            success: true,
            message: "Food item added successfully.",
            food
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get All Foods
 * GET /api/foods
 */
export const getAllFoods = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 24;
        const skip = (page - 1) * limit;

        const search = req.query.search || "";
        const category = req.query.category || "";
        const sort = req.query.sort || "latest";
        const area = req.query.area || "";

        let andConditions = [];

        if (req.query.all !== "true") {
            andConditions.push({ isAvailable: true });
        }

        // Multilingual / comprehensive search
        if (search) {
            andConditions.push({
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { category: { $regex: search, $options: "i" } },
                    { restaurant: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } }
                ]
            });
        }

        // Category matching: handles "burger", "burgers", "fast-food", "Fast Food", etc.
        if (category && category !== "All" && category !== "all") {
            const cleanCat = category.trim().replace(/-/g, "[ -]?");
            let pattern = cleanCat;
            if (/^burgers?$/i.test(cleanCat)) {
                pattern = "burgers?";
            } else if (/^salads?$/i.test(cleanCat)) {
                pattern = "salads?";
            } else if (/^desserts?$/i.test(cleanCat)) {
                pattern = "desserts?";
            } else if (/^noodles?$/i.test(cleanCat)) {
                pattern = "noodles?";
            } else if (/^drinks?$/i.test(cleanCat)) {
                pattern = "drinks?";
            }
            andConditions.push({
                category: { $regex: new RegExp(`^${pattern}$`, "i") }
            });
        }

        // Area filtering
        if (area && area !== "All" && area !== "all") {
            const areaRegex = new RegExp(`^${area.trim()}$`, "i");
            andConditions.push({
                $or: [
                    { area: { $regex: areaRegex } },
                    { areas: { $in: [areaRegex] } },
                    { city: { $regex: areaRegex } }
                ]
            });
        }

        // Vegetarian filter
        if (req.query.isVeg !== undefined && req.query.isVeg !== "") {
            andConditions.push({
                isVeg: req.query.isVeg === "true" || req.query.isVeg === true
            });
        }

        // Restaurant filter
        if (req.query.restaurant && req.query.restaurant !== "All") {
            andConditions.push({
                restaurant: { $regex: new RegExp(req.query.restaurant.trim(), "i") }
            });
        }

        // Price range filter
        if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
            const priceQuery = {};
            if (req.query.minPrice) priceQuery.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) priceQuery.$lte = Number(req.query.maxPrice);
            andConditions.push({ price: priceQuery });
        }

        // Rating filter
        if (req.query.minRating) {
            andConditions.push({
                rating: { $gte: Number(req.query.minRating) }
            });
        }

        if (req.query.featured === "true") {
            andConditions.push({ featured: true });
        }

        const query = andConditions.length > 0 ? { $and: andConditions } : {};

        let sortOption = {};
        switch (sort) {
            case "priceLow":
            case "price_asc":
                sortOption = { price: 1 };
                break;
            case "priceHigh":
            case "price_desc":
                sortOption = { price: -1 };
                break;
            case "rating":
                sortOption = { rating: -1, totalReviews: -1 };
                break;
            case "popularity":
            case "popular":
                sortOption = { totalReviews: -1, rating: -1 };
                break;
            case "latest":
            default:
                sortOption = { createdAt: -1 };
        }

        const totalFoods = await Food.countDocuments(query);
        const foods = await Food.find(query)
            .populate("restaurantId", "name rating address cuisineTypes deliveryFee minimumOrderAmount status")
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            totalFoods,
            currentPage: page,
            totalPages: Math.ceil(totalFoods / limit) || 1,
            foods,
            data: foods
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Food By ID
 * GET /api/foods/:id
 */
export const getFoodById = async (req, res, next) => {
    try {
        const food = await Food.findById(req.params.id)
            .populate("restaurantId", "name rating address cuisineTypes deliveryFee minimumOrderAmount status");

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food item not found."
            });
        }

        const foodObj = food.toObject();
        if (!foodObj.customizationOptions || !foodObj.customizationOptions.sections || foodObj.customizationOptions.sections.length === 0) {
            foodObj.customizationOptions = getDefaultCustomizationForCategory(food.category, food);
        }

        return res.status(200).json({
            success: true,
            food: foodObj
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Food
 * PUT /api/foods/:id
 */
export const updateFood = async (req, res, next) => {
    try {
        const food = await Food.findById(req.params.id);

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food item not found."
            });
        }

        if (req.body.name) food.name = req.body.name.trim();
        if (req.body.description) food.description = req.body.description.trim();
        if (req.body.category) food.category = req.body.category.trim();
        if (req.body.restaurant) food.restaurant = req.body.restaurant.trim();
        if (req.body.area) food.area = req.body.area.trim();
        if (req.body.areas) food.areas = Array.isArray(req.body.areas) ? req.body.areas : [req.body.areas];

        if (req.body.price !== undefined) food.price = Number(req.body.price);
        if (req.body.discountPrice !== undefined) food.discountPrice = Number(req.body.discountPrice);
        if (req.body.stock !== undefined) food.stock = Number(req.body.stock);
        if (req.body.preparationTime !== undefined) food.preparationTime = Number(req.body.preparationTime);
        if (req.body.rating !== undefined) food.rating = Number(req.body.rating);

        if (req.body.isVeg !== undefined) {
            food.isVeg = req.body.isVeg === "true" || req.body.isVeg === true;
        }
        if (req.body.featured !== undefined) {
            food.featured = req.body.featured === "true" || req.body.featured === true;
        }
        if (req.body.isAvailable !== undefined) {
            food.isAvailable = req.body.isAvailable === "true" || req.body.isAvailable === true;
        }

        // Update Image
        if (req.file) {
            const oldImage = path.join("uploads", food.image);
            if (fs.existsSync(oldImage) && !food.image.includes("http")) {
                try { fs.unlinkSync(oldImage); } catch (e) {}
            }
            food.image = req.file.filename;
        } else if (req.body.image) {
            food.image = req.body.image;
        }

        await food.save();

        return res.status(200).json({
            success: true,
            message: "Food updated successfully.",
            food
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete Food
 * DELETE /api/foods/:id
 */
export const deleteFood = async (req, res, next) => {
    try {
        const food = await Food.findById(req.params.id);

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food item not found."
            });
        }

        const imagePath = path.join("uploads", food.image);
        if (fs.existsSync(imagePath) && !food.image.includes("http")) {
            try { fs.unlinkSync(imagePath); } catch (e) {}
        }

        await Food.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Food item deleted successfully."
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Search Foods
 * GET /api/foods/search
 */
export const searchFoods = async (req, res, next) => {
    try {
        const keyword = req.query.keyword || req.query.q || "";

        const query = {
            isAvailable: true
        };

        if (keyword) {
            query.$or = [
                { name: { $regex: keyword, $options: "i" } },
                { category: { $regex: keyword, $options: "i" } },
                { restaurant: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ];
        }

        const foods = await Food.find(query).limit(50);

        return res.status(200).json({
            success: true,
            total: foods.length,
            foods
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Foods By Category
 * GET /api/foods/category/:category
 */
export const getFoodsByCategory = async (req, res, next) => {
    try {
        const { category } = req.params;
        req.query.category = category;
        return getAllFoods(req, res, next);
    } catch (error) {
        next(error);
    }
};

/**
 * Get Featured Foods
 * GET /api/foods/featured
 */
export const getFeaturedFoods = async (req, res, next) => {
    try {
        const foods = await Food.find({
            featured: true,
            isAvailable: true
        })
            .populate("restaurantId", "name rating address cuisineTypes")
            .sort({ rating: -1 })
            .limit(8);

        return res.status(200).json({
            success: true,
            foods
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Latest Foods
 * GET /api/foods/latest
 */
export const getLatestFoods = async (req, res, next) => {
    try {
        const foods = await Food.find({ isAvailable: true })
            .populate("restaurantId", "name rating address cuisineTypes")
            .sort({ createdAt: -1 })
            .limit(10);

        return res.status(200).json({
            success: true,
            foods
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Popular Foods
 * GET /api/foods/popular
 */
export const getPopularFoods = async (req, res, next) => {
    try {
        const foods = await Food.find({ isAvailable: true })
            .populate("restaurantId", "name rating address cuisineTypes")
            .sort({ rating: -1, totalReviews: -1 })
            .limit(12);

        return res.status(200).json({
            success: true,
            foods
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Related Foods
 * GET /api/foods/:id/related
 */
export const getRelatedFoods = async (req, res, next) => {
    try {
        const food = await Food.findById(req.params.id);

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food item not found."
            });
        }

        const relatedFoods = await Food.find({
            category: food.category,
            _id: { $ne: food._id },
            isAvailable: true
        }).limit(6);

        return res.status(200).json({
            success: true,
            foods: relatedFoods
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get All Food Categories with Counts
 * GET /api/foods/categories
 */
export const getCategories = async (req, res, next) => {
    try {
        const area = req.query.area || "";
        const matchStage = { isAvailable: true };
        if (area && area !== "All" && area !== "all") {
            const areaRegex = new RegExp(`^${area.trim()}$`, "i");
            matchStage.$or = [
                { area: { $regex: areaRegex } },
                { areas: { $in: [areaRegex] } },
                { city: { $regex: areaRegex } }
            ];
        }

        const categoryAggregation = await Food.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 },
                    image: { $first: "$image" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const categories = categoryAggregation.map(c => ({
            name: c._id,
            count: c.count,
            image: c.image
        }));

        return res.status(200).json({
            success: true,
            total: categories.length,
            categories,
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Reviews for Food
 * GET /api/foods/:id/reviews
 */
export const getFoodReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ food: req.params.id })
            .sort({ createdAt: -1 })
            .limit(50);

        return res.status(200).json({
            success: true,
            total: reviews.length,
            reviews,
            data: reviews
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create Food Review
 * POST /api/foods/:id/reviews
 */
export const createFoodReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || Number(rating) < 1 || Number(rating) > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5."
            });
        }

        if (!comment || !comment.trim()) {
            return res.status(400).json({
                success: false,
                message: "Review comment is required."
            });
        }

        const food = await Food.findById(req.params.id);
        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food item not found."
            });
        }

        const review = await Review.create({
            user: req.user._id,
            userName: req.user.fullName || "Foodie Customer",
            food: food._id,
            rating: Number(rating),
            comment: comment.trim()
        });

        // Recalculate average rating
        const allReviews = await Review.find({ food: food._id });
        const avgRating = (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1);

        food.rating = Number(avgRating);
        food.totalReviews = allReviews.length;
        await food.save();

        return res.status(201).json({
            success: true,
            message: "Thank you! Your review has been added.",
            review,
            foodRating: food.rating,
            totalReviews: food.totalReviews,
            food,
            data: { review, food }
        });
    } catch (error) {
        next(error);
    }
};
