"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.getCategory = exports.getAllCategories = exports.editCategory = exports.createCategory = void 0;
const Category_model_1 = __importDefault(require("../models/Category.model"));
//  create category
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, image, categorySlug, status } = req.body;
    if (!name)
        return res.status(200).json({
            error: true,
            message: "Please provide a category name",
        });
    if (!description)
        return res.status(200).json({
            error: true,
            message: "Please provide category description",
        });
    if (!image)
        return res.status(200).json({
            error: true,
            message: "Please provide category images",
        });
    try {
        const category = yield Category_model_1.default.create({
            name,
            description,
            image,
            categorySlug,
            status
        });
        res.status(200).json({
            error: false,
            category,
            message: "new category created successfully",
        });
    }
    catch (err) {
        return res.status(500).json({
            error: true,
            err,
            message: "Internal server error, Please try again",
        });
    }
});
exports.createCategory = createCategory;
// update category
const editCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId } = req.params;
    const { name, description, image, categorySlug, status } = req.body;
    try {
        const categoryDetails = yield Category_model_1.default.findOne({ _id: categoryId });
        if (!categoryDetails)
            return res.status(404).json({
                error: true,
                message: "category not found",
            });
        if (name)
            categoryDetails.name = name;
        if (description)
            categoryDetails.description = description;
        if (image)
            categoryDetails.image = image;
        if (categorySlug)
            categoryDetails.categorySlug = categorySlug;
        categoryDetails.status = status;
        yield categoryDetails.save();
        res.status(200).json({
            error: false,
            category: categoryDetails,
            message: "category updated successfully",
        });
    }
    catch (err) {
        return res.status(500).json({
            error: true,
            err,
            message: "Internal server error",
        });
    }
});
exports.editCategory = editCategory;
// Get all categories
const getAllCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield Category_model_1.default.find();
        res.status(200).json({
            error: false,
            category,
            message: "All category retrieved successfully",
        });
    }
    catch (err) {
        return res.status(500).json({
            error: true,
            err,
            message: "Internal server error",
        });
    }
});
exports.getAllCategories = getAllCategories;
// Get category
const getCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId } = req.params;
    try {
        const category = yield Category_model_1.default.findOne({ _id: categoryId });
        if (!category) {
            return res.status(200).json({
                error: true,
                message: "category not found",
            });
        }
        res.status(200).json({
            error: false,
            category,
            message: "category fetched successfully",
        });
    }
    catch (err) {
        return res.status(500).json({
            error: true,
            err,
            message: "Internal server error",
        });
    }
});
exports.getCategory = getCategory;
// Delete category
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId } = req.params;
    try {
        const categoryDetails = yield Category_model_1.default.deleteOne({ _id: categoryId });
        if (!categoryDetails) {
            return res.status(404).json({
                error: true,
                message: "category not found",
            });
        }
        return res.json({
            error: false,
            message: "category deleted successfully",
        });
    }
    catch (err) {
        res.status(500).json({
            error: true,
            err,
            message: "Internal server Error",
        });
    }
});
exports.deleteCategory = deleteCategory;
