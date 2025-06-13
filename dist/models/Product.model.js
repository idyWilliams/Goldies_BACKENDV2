"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const categoryT = new mongoose_1.Schema({
    name: { type: String, required: true },
    id: { type: String, required: true },
});
const productSchema = new mongoose_1.Schema({
    name: { type: String, require: true },
    description: { type: String, require: true },
    shapes: { type: Array, require: false },
    sizes: { type: Array, require: false },
    productType: { type: String, require: false },
    toppings: { type: Array, require: false },
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    subCategories: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: "SubCategory",
        required: true,
    },
    minPrice: { type: String, require: true },
    maxPrice: { type: String, require: true },
    images: { type: Array, require: true },
    flavour: { type: Array, required: false },
    status: { type: String, required: true },
    productCode: { type: String, required: false },
    slug: { type: String, required: false, unique: true },
    // Review and rating statistics - these will be updated when reviews are created/updated/deleted
    averageRating: { type: Number, default: 0 },
    ratingsCount: {
        total: { type: Number, default: 0 },
        "5": { type: Number, default: 0 },
        "4": { type: Number, default: 0 },
        "3": { type: Number, default: 0 },
        "2": { type: Number, default: 0 },
        "1": { type: Number, default: 0 },
    },
    reviewsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
}, {
    timestamps: true,
});
// Add index for more efficient review-related queries
productSchema.index({ averageRating: -1 });
productSchema.index({ reviewsCount: -1 });
const Product = (0, mongoose_1.model)("Product", productSchema);
exports.default = Product;
//# sourceMappingURL=Product.model.js.map