"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const subCategorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Please provide a sub category name"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Please provide subCategory description"],
        trim: true,
    },
    subCategorySlug: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
    },
    image: {
        type: String,
        required: [true, "Please provide sub category image"],
    },
    status: {
        type: Boolean,
        required: [true, "SubCategory status is required"],
        default: true,
    },
    categoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
subCategorySchema.virtual("products", {
    ref: "Product",
    localField: "_id",
    foreignField: "subCategories",
    justOne: false,
    count: true,
});
const SubCategory = (0, mongoose_1.model)("SubCategory", subCategorySchema);
exports.default = SubCategory;
//# sourceMappingURL=SubCategory.model.js.map