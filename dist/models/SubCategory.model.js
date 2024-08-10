"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const subCategorySchema = new mongoose_1.Schema({
    name: { type: String, require: [true, "Please provide a sub category name"] },
    description: {
        type: String,
        require: [true, "Please provide subCategory description"],
    },
    image: {
        type: String,
        require: [true, "Please provide sub category images"],
    },
    status: {
        type: Boolean,
        require: [true, "SubCategory status is not providedd"],
    },
});
const SubCategory = (0, mongoose_1.model)("SubCategory", subCategorySchema);
exports.default = SubCategory;
