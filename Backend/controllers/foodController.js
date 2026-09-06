import Food from "../models/Food.js";

/**
 * ===========================================
 * Add New Food
 * POST /api/foods
 * ===========================================
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
            restaurant
        } = req.body;

        // ==========================
        // Validation
        // ==========================

        if (
            !name ||
            !description ||
            !category ||
            !price
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Food image is required."
            });
        }

        // ==========================
        // Create Food
        // ==========================

        const food = await Food.create({
            name,
            description,
            category,
            price,
            discountPrice: discountPrice || 0,
            image: req.file.filename,
            isVeg: isVeg ?? true,
            preparationTime: preparationTime || 20,
            stock: stock || 100,
            featured: featured || false,
            restaurant: restaurant || "Online Food Delivery"
        });

        return res.status(201).json({
            success: true,
            message: "Food added successfully.",
            food
        });

    } catch (error) {
        next(error);
    }
};
/**
 * ===========================================
 * Get All Foods
 * GET /api/foods
 * ===========================================
 */

export const getAllFoods = async (req, res, next) => {
    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const search = req.query.search || "";
        const category = req.query.category || "";
        const sort = req.query.sort || "latest";

        let query = {
            isAvailable: true
        };

        // Search
        if (search) {
            query.name = {
                $regex: search,
                $options: "i"
            };
        }

        // Category
        if (category) {
            query.category = category;
        }

        // Sorting
        let sortOption = {};

        switch (sort) {
            case "priceLow":
                sortOption = { price: 1 };
                break;

            case "priceHigh":
                sortOption = { price: -1 };
                break;

            case "rating":
                sortOption = { rating: -1 };
                break;

            case "latest":
            default:
                sortOption = { createdAt: -1 };
        }

        const totalFoods = await Food.countDocuments(query);

        const foods = await Food.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            totalFoods,
            currentPage: page,
            totalPages: Math.ceil(totalFoods / limit),
            foods
        });

    } catch (error) {
        next(error);
    }
};

/**
 * ===========================================
 * Get Food By ID
 * GET /api/foods/:id
 * ===========================================
 */

export const getFoodById = async (req, res, next) => {
    try {

        const food = await Food.findById(req.params.id);

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food item not found."
            });
        }

        return res.status(200).json({
            success: true,
            food
        });

    } catch (error) {
        next(error);
    }
};import fs from "fs";
import path from "path";

/**
 * ===========================================
 * Update Food
 * PUT /api/foods/:id
 * ===========================================
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

        // Update basic fields
        food.name = req.body.name || food.name;
        food.description = req.body.description || food.description;
        food.category = req.body.category || food.category;

        if (req.body.price !== undefined)
            food.price = req.body.price;

        if (req.body.discountPrice !== undefined)
            food.discountPrice = req.body.discountPrice;

        if (req.body.stock !== undefined)
            food.stock = req.body.stock;

        if (req.body.preparationTime !== undefined)
            food.preparationTime = req.body.preparationTime;

        if (req.body.restaurant)
            food.restaurant = req.body.restaurant;

        if (req.body.isVeg !== undefined)
            food.isVeg = req.body.isVeg;

        if (req.body.featured !== undefined)
            food.featured = req.body.featured;

        if (req.body.isAvailable !== undefined)
            food.isAvailable = req.body.isAvailable;

        // Update Image
        if (req.file) {

            const oldImage = path.join("uploads", food.image);

            if (fs.existsSync(oldImage)) {
                fs.unlinkSync(oldImage);
            }

            food.image = req.file.filename;
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
 * ===========================================
 * Delete Food
 * DELETE /api/foods/:id
 * ===========================================
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

        // Delete image
        const imagePath = path.join("uploads", food.image);

        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await Food.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Food deleted successfully."
        });

    } catch (error) {
        next(error);
    }
};/**
* ===========================================
* Search Foods
* GET /api/foods/search
* ===========================================
*/

export const searchFoods = async (req, res, next) => {
   try {

       const keyword = req.query.keyword || "";

       const foods = await Food.find({
           name: {
               $regex: keyword,
               $options: "i"
           },
           isAvailable: true
       });

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
* ===========================================
* Get Foods By Category
* GET /api/foods/category/:category
* ===========================================
*/

export const getFoodsByCategory = async (req, res, next) => {
   try {

       const foods = await Food.find({
           category: req.params.category,
           isAvailable: true
       }).sort({
           createdAt: -1
       });

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
* ===========================================
* Get Featured Foods
* GET /api/foods/featured
* ===========================================
*/

export const getFeaturedFoods = async (req, res, next) => {
   try {

       const foods = await Food.find({
           featured: true,
           isAvailable: true
       })
       .sort({
           rating: -1
       })
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
* ===========================================
* Get Latest Foods
* GET /api/foods/latest
* ===========================================
*/

export const getLatestFoods = async (req, res, next) => {
   try {

       const foods = await Food.find({
           isAvailable: true
       })
       .sort({
           createdAt: -1
       })
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
* ===========================================
* Get Popular Foods
* GET /api/foods/popular
* ===========================================
*/

export const getPopularFoods = async (req, res, next) => {
   try {

       const foods = await Food.find({
           isAvailable: true
       })
       .sort({
           rating: -1,
           totalReviews: -1
       })
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
* ===========================================
* Get Related Foods
* GET /api/foods/:id/related
* ===========================================
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
       })
       .limit(6);

       return res.status(200).json({
           success: true,
           foods: relatedFoods
       });

   } catch (error) {
       next(error);
   }
};