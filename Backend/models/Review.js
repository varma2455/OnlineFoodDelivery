import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        userName: {
            type: String,
            required: true,
            trim: true
        },
        food: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Food",
            required: true,
            index: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        }
    },
    {
        timestamps: true
    }
);

reviewSchema.index({ food: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
