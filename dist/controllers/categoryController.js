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
const SubCategory_model_1 = __importDefault(require("../models/SubCategory.model"));
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
// Get all categories with pagination
const getAllCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = req.query.page ? parseInt(req.query.page, 10) : null;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
        const skip = page && limit ? (page - 1) * limit : 0;
        const totalCategories = yield Category_model_1.default.countDocuments();
        const allCategoriesQuery = Category_model_1.default.find().sort({ createdAt: -1 });
        const allCategories = page && limit
            ? yield allCategoriesQuery.skip(skip).limit(limit).lean()
            : yield allCategoriesQuery.lean();
        const allSubCategories = yield SubCategory_model_1.default.find().lean();
        const categoriesWithSubcategories = allCategories.map((category) => {
            const subCategories = allSubCategories.filter((subCategory) => subCategory.categoryId.toString() === category._id.toString());
            return Object.assign(Object.assign({}, category), { subCategories });
        });
        const totalPages = page && limit ? Math.ceil(totalCategories / limit) : 1;
        res.status(200).json({
            error: false,
            categories: categoriesWithSubcategories,
            totalPages,
            currentPage: page || 1,
            totalCategories,
            message: "Categories retrieved successfully",
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
        // Find the category by ID
        const category = yield Category_model_1.default.findById(categoryId).lean(); // Use `.lean()` to get a plain JavaScript object
        if (!category) {
            return res.status(404).json({
                error: true,
                message: "Category not found",
            });
        }
        // Find all subcategories associated with this category
        const subCategories = yield SubCategory_model_1.default.find({ categoryId: category._id }).lean();
        // Combine category data with its subcategories
        const categoryWithSubcategories = Object.assign(Object.assign({}, category), { subCategories });
        res.status(200).json({
            error: false,
            category: categoryWithSubcategories,
            message: "Category fetched successfully",
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
