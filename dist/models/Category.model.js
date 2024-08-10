"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    name: { type: String, require: [true, "Please provide a category name"] },
    description: {
        type: String,
        require: [true, "Please provide category description"],
    },
    categorySlug: String,
    images: { type: Array, require: [true, "Please provide category images"] },
});
const Category = (0, mongoose_1.model)("Category", categorySchema);
exports.default = Category;
