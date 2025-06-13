"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.getCategory = exports.getAllCategories = exports.editCategory = exports.createCategory = void 0;
const Category_model_1 = __importDefault(require("../models/Category.model"));
const SubCategory_model_1 = __importDefault(require("../models/SubCategory.model"));
const Product_model_1 = __importDefault(require("../models/Product.model"));
//  create category
const createCategory = async (req, res) => {
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
        const category = await Category_model_1.default.create({
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
};
exports.createCategory = createCategory;
// update category
const editCategory = async (req, res) => {
    const { categoryId } = req.params;
    const { name, description, image, categorySlug, status } = req.body;
    try {
        const categoryDetails = await Category_model_1.default.findOne({ _id: categoryId });
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
        await categoryDetails.save();
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
};
exports.editCategory = editCategory;
// Get all categories with pagination
const getAllCategories = async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page, 10) : null;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
        const search = req.query.search ? req.query.search.toString() : "";
        const sortByStatus = req.query.sortByStatus ? req.query.sortByStatus.toString() : null;
        const sortByProducts = req.query.sortByProducts ? req.query.sortByProducts.toString() : null;
        const sortBySubcategories = req.query.sortBySubcategories ? req.query.sortBySubcategories.toString() : null;
        const skip = page && limit ? (page - 1) * limit : 0;
        // Search query for category name
        const searchQuery = search
            ? { name: { $regex: search, $options: "i" } }
            : {};
        // Fetch categories with search filter
        let allCategoriesQuery = Category_model_1.default.find(searchQuery).sort({ createdAt: -1 });
        let allCategories = page && limit
            ? await allCategoriesQuery.skip(skip).limit(limit).lean()
            : await allCategoriesQuery.lean();
        // Fetch subcategories
        const allSubCategories = await SubCategory_model_1.default.find().lean();
        // Attach subcategories and count products
        const categoriesWithSubcategories = await Promise.all(allCategories.map(async (category) => {
            const subCategories = allSubCategories.filter((subCategory) => subCategory.categoryId.toString() === category._id.toString());
            // Count number of products in the category
            const productCount = await Product_model_1.default.countDocuments({ categoryId: category._id });
            return {
                ...category,
                subCategories,
                subCategoryCount: subCategories.length,
                productCount,
            };
        }));
        // Sorting by status
        if (sortByStatus !== null) {
            const statusBoolean = sortByStatus === "true"; // Convert to boolean
            categoriesWithSubcategories.sort((a, b) => (a.status === statusBoolean ? -1 : 1));
        }
        // Sorting by number of products
        if (sortByProducts !== null) {
            const order = sortByProducts === "desc" ? -1 : 1;
            categoriesWithSubcategories.sort((a, b) => (a.productCount - b.productCount) * order);
        }
        // Sorting by number of subcategories
        if (sortBySubcategories !== null) {
            const order = sortBySubcategories === "desc" ? -1 : 1;
            categoriesWithSubcategories.sort((a, b) => (a.subCategoryCount - b.subCategoryCount) * order);
        }
        const totalCategories = await Category_model_1.default.countDocuments(searchQuery);
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
};
exports.getAllCategories = getAllCategories;
// Get category
const getCategory = async (req, res) => {
    const { categoryId } = req.params;
    try {
        // Find the category by ID
        const category = await Category_model_1.default.findById(categoryId).lean(); // Use `.lean()` to get a plain JavaScript object
        if (!category) {
            return res.status(404).json({
                error: true,
                message: "Category not found",
            });
        }
        // Find all subcategories associated with this category
        const subCategories = await SubCategory_model_1.default.find({ categoryId: category._id }).lean();
        // Combine category data with its subcategories
        const categoryWithSubcategories = {
            ...category,
            subCategories,
        };
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
};
exports.getCategory = getCategory;
// Delete category
const deleteCategory = async (req, res) => {
    const { categoryId } = req.params;
    try {
        const categoryDetails = await Category_model_1.default.deleteOne({ _id: categoryId });
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
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=categoryController.js.map