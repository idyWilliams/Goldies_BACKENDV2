"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Please provide a category name"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Please provide category description"],
        trim: true,
    },
    categorySlug: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
    },
    image: {
        type: String,
        required: [true, "Please provide category image"],
    },
    status: {
        type: Boolean,
        required: [true, "Category status is required"],
        default: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Virtual fields for counts
categorySchema.virtual("subCategories", {
    ref: "SubCategory",
    localField: "_id",
    foreignField: "categoryId",
    justOne: false,
    count: true,
});
categorySchema.virtual("products", {
    ref: "Product",
    localField: "_id",
    foreignField: "category",
    justOne: false,
    count: true,
});
const Category = (0, mongoose_1.model)("Category", categorySchema);
exports.default = Category;
//# sourceMappingURL=Category.model.js.map