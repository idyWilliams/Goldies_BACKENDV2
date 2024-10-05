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
    images: { type: Array, require: true },
    category: { type: categoryT, require: true },
    subCategory: { type: categoryT, require: true },
    minPrice: { type: String, require: true },
    maxPrice: { type: String, require: true },
    sizes: { type: Array, require: true },
    productType: { type: String, require: true },
    toppings: { type: Array, require: true },
    flavour: Array,
}, {
    timestamps: true,
});
const Product = (0, mongoose_1.model)("Product", productSchema);
exports.default = Product;
