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
exports.getProduct = exports.getAllProducts = exports.deleteProduct = exports.editProduct = exports.createProduct = void 0;
const Product_model_1 = __importDefault(require("../models/Product.model"));
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category, flavour, description, images, maxPrice, minPrice, name, productType, shapes, sizes, subCategory, toppings, status } = req.body;
    if (!category ||
        !flavour ||
        !description ||
        !images ||
        !maxPrice ||
        !minPrice ||
        !name ||
        !productType ||
        !shapes ||
        !sizes ||
        !subCategory ||
        !toppings || !status) {
        return res.status(404).json({
            error: true,
            message: "Please fill out all fields",
        });
    }
    const productCode = generateUniqueId();
    try {
        const productDetails = yield Product_model_1.default.create({
            category,
            flavour,
            description,
            images,
            maxPrice,
            minPrice,
            name,
            productType,
            shapes,
            sizes,
            subCategory,
            toppings,
            status,
            productCode
        });
        return res.status(200).json({
            error: false,
            productDetails,
            message: "Product Created successfully",
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
exports.createProduct = createProduct;
const generatedIds = new Set(); // Store unique IDs
function generateUniqueId() {
    const prefix = "GOL";
    let uniqueId;
    do {
        const randomNumbers = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
        uniqueId = `${prefix}${randomNumbers}`;
    } while (generatedIds.has(uniqueId)); // Ensure the ID is not already in the set
    generatedIds.add(uniqueId); // Add the new unique ID to the set
    return uniqueId;
}
const editProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const { name, description, shapes, sizes, productType, toppings, category, subCategory, minPrice, maxPrice, images, flavour, status } = req.body;
    try {
        const productDetails = yield Product_model_1.default.findOne({ _id: productId });
        if (!productDetails) {
            return res.status(400).json({
                error: true,
                message: "product not found",
            });
        }
        if (name)
            productDetails.name = name;
        if (description)
            productDetails.description = description;
        if (shapes)
            productDetails.shapes = shapes;
        if (sizes)
            productDetails.sizes = sizes;
        if (productType)
            productDetails.productType = productType;
        if (toppings)
            productDetails.toppings = toppings;
        if (category)
            productDetails.category = category;
        if (subCategory)
            productDetails.subCategory = subCategory;
        if (minPrice)
            productDetails.minPrice = minPrice;
        if (maxPrice)
            productDetails.maxPrice = maxPrice;
        if (images)
            productDetails.images = images;
        if (flavour)
            productDetails.flavour = flavour;
        if (status)
            productDetails.status = status;
        yield productDetails.save();
        res.json({
            error: false,
            productDetails,
            message: "Product updated successfully",
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
exports.editProduct = editProduct;
const getProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        const productDetails = yield Product_model_1.default.findOne({ _id: productId });
        if (!productDetails) {
            return res.status(400).json({
                error: true,
                message: "product not found",
            });
        }
        return res.json({
            error: false,
            productDetails,
            message: "Product Retrieved successfully",
        });
    }
    catch (err) {
        return res.status(500).json({
            error: true,
            err,
            message: "Internal Server error",
        });
    }
});
exports.getProduct = getProduct;
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subCategoryIds, categoryIds, minPrice, maxPrice, searchQuery, page = 1, limit = 10, sortBy = "createdAt", // Default sorting by createdAt
        order = "desc", // Default order is descending
         } = req.query;
        const filters = {};
        if (categoryIds) {
            filters["category.id"] = { $in: categoryIds.split(",") };
        }
        if (subCategoryIds) {
            filters["subCategory.id"] = {
                $in: subCategoryIds.split(","),
            };
        }
        if (minPrice || maxPrice) {
            filters.minPrice = {};
            if (minPrice)
                filters.minPrice.$gte = parseFloat(minPrice);
            if (maxPrice)
                filters.minPrice.$lte = parseFloat(maxPrice);
        }
        if (searchQuery && searchQuery.trim() !== "") {
            filters.$or = [
                { name: { $regex: searchQuery, $options: "i" } },
                { description: { $regex: searchQuery, $options: "i" } },
                { productCode: { $regex: searchQuery, $options: "i" } },
            ];
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        // Ensure `sortBy` is a valid string and cast it
        const validSortBy = typeof sortBy === 'string' ? sortBy : 'createdAt'; // Fallback to 'createdAt' if invalid
        const sortOrder = order === "asc" ? 1 : -1;
        // Apply sorting
        const productDetails = yield Product_model_1.default.find(filters)
            .sort({ [validSortBy]: sortOrder }) // Sort by the specified field and order
            .skip(skip)
            .limit(parseInt(limit))
            .exec();
        const totalProducts = yield Product_model_1.default.countDocuments(filters);
        const totalPages = Math.ceil(totalProducts / parseInt(limit));
        return res.status(200).json({
            error: false,
            products: productDetails,
            totalPages,
            currentPage: parseInt(page),
            totalProducts,
            message: "Products retrieved successfully",
        });
    }
    catch (err) {
        return res.status(500).json({
            error: true,
            err,
            message: "Internal Server error",
        });
    }
});
exports.getAllProducts = getAllProducts;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    try {
        const productDetails = yield Product_model_1.default.deleteOne({ _id: productId });
        if (!productDetails) {
            return res.status(404).json({
                error: true,
                message: "product not found",
            });
        }
        return res.json({
            error: false,
            message: "product deleted successfully",
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
exports.deleteProduct = deleteProduct;
