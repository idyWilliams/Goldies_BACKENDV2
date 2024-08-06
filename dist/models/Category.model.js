"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    name: { type: String, require: true },
    description: { type: String, require: true },
    images: { type: Array, require: true },
    category: { type: String, require: true },
    minPrice: { type: String, require: true },
    maxPrice: { type: String, require: true },
    shapes: { type: Array, require: true },
    sizes: { type: Array, require: true },
    fillings: { type: Array, require: true },
    toppings: { type: Array, require: true },
}, {
    timestamps: true,
});
const Category = (0, mongoose_1.model)("Category", categorySchema);
exports.default = Category;
