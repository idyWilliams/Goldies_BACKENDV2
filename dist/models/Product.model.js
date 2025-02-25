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
    shapes: { type: Array, require: true },
    sizes: { type: Array, require: true },
    productType: { type: String, require: true },
    toppings: { type: Array, require: true },
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subCategories: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'SubCategory',
        required: true
    },
    minPrice: { type: String, require: true },
    maxPrice: { type: String, require: true },
    images: { type: Array, require: true },
    flavour: { type: Array, required: false },
    status: { type: String, required: true },
    productCode: { type: String, required: false }
}, {
    timestamps: true,
});
const Product = (0, mongoose_1.model)("Product", productSchema);
exports.default = Product;
