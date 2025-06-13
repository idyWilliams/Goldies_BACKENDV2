"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubCategory = exports.getSubCategory = exports.getAllSubCategory = exports.updateSubCategory = exports.createSubCategory = void 0;
const SubCategory_model_1 = __importDefault(require("../models/SubCategory.model"));
const Category_model_1 = __importDefault(require("../models/Category.model"));
// Create SubCategories
const createSubCategory = async (req, res) => {
    const { name, description, image, status, categoryId } = req.body;
    try {
        const category = await Category_model_1.default.findOne({ _id: categoryId });
        if (!category)
            return res.status(404).json({
                error: true,
                message: "Wrong category id provided"
            });
        const subCategory = await SubCategory_model_1.default.create({
            name,
            description,
            image,
            status,
            categoryId
        });
        res.status(200).json({
            error: false,
            subCategory,
            message: "SubCategory created successfully",
        });
    }
    catch (err) {
        return res.status(500).json({
            error: true,
            err,
            message: "Internal server error, Please try again",
        });
    }
};
exports.createSubCategory = createSubCategory;
// Update subCategory
const updateSubCategory = async (req, res) => {
    const { subCategoryId } = req.params;
    const { name, description, image, status } = req.body;
    try {
        const subCategory = await SubCategory_model_1.default.findOne({ _id: subCategoryId });
        if (!subCategory) {
            return res.status(200).json({
                error: true,
                message: "subCategory not found, please try again with the correct ID",
            });
        }
        if (name)
            subCategory.name = name;
        if (description)
            subCategory.description = description;
        if (image)
            subCategory.image = image;
        subCategory.status = status;
        await subCategory.save();
        return res.status(200).json({
            error: false,
            subCategory,
            message: "SubCategory updated successfully",
        });
    }
    catch (err) {
        return res.status(500).json({
            error: true,
            err,
            message: "Internal server error, Please try again",
        });
    }
};
exports.updateSubCategory = updateSubCategory;
// Get all subCategories with pagination
const getAllSubCategory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const totalSubCategories = await SubCategory_model_1.default.countDocuments();
        // Get paginated subcategories
        const subCategories = await SubCategory_model_1.default.find().skip(skip).limit(limit).lean();
        res.status(200).json({
            error: false,
            subCategories,
            totalPages: Math.ceil(totalSubCategories / limit),
            currentPage: page,
            totalSubCategories,
            message: "All subcategories fetched successfully",
        });
    }
    catch (err) {
        return res.status(500).json({
            error: true,
            err,
            message: "Internal server error, please try again",
        });
    }
};
exports.getAllSubCategory = getAllSubCategory;
// Get sub category
const getSubCategory = async (req, res) => {
    const { subCategoryId } = req.params;
    try {
        const subCategory = await SubCategory_model_1.default.findOne({ _id: subCategoryId });
        if (!subCategory) {
            return res.status(200).json({
                error: true,
                message: "subCategory not found, please try again with the correct ID",
            });
        }
        return res.status(200).json({
            error: false,
            subCategory,
            message: "subCategory data fetched successfully",
        });
    }
    catch (err) {
        return res.status(500).json({
            error: true,
            err,
            message: "Internal server error, Please try again",
        });
    }
};
exports.getSubCategory = getSubCategory;
// delete subCategory
const deleteSubCategory = async (req, res) => {
    const { subCategoryId } = req.params;
    try {
        const subCategory = await SubCategory_model_1.default.deleteOne({ _id: subCategoryId });
        if (!subCategory) {
            return res.status(404).json({
                error: true,
                message: "SubCategory not found",
            });
        }
        return res.json({
            error: false,
            message: "Subcategory deleted successfully",
        });
    }
    catch (err) {
        res.status(500).json({
            error: true,
            err,
            message: "Internal server Error",
        });
    }
};
exports.deleteSubCategory = deleteSubCategory;
//# sourceMappingURL=subCategoryController.js.map