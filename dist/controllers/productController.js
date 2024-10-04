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
    const { name, description, images, category, minPrice, maxPrice, subCategory, productType, sizes, flavour, toppings, } = req.body;
    if (!name ||
        !description ||
        !images ||
        !category ||
        !minPrice ||
        !maxPrice ||
        !productType ||
        !sizes ||
        !subCategory ||
        !toppings) {
        return res.status(404).json({
            error: true,
            message: "Please fill out all fields",
        });
    }
    try {
        const categoryDetails = yield Product_model_1.default.create({
            name,
            description,
            images,
            category,
            minPrice,
            maxPrice,
            subCategory,
            productType,
            sizes,
            flavour,
            toppings,
        });
        return res.status(200).json({
            error: false,
            categoryDetails,
            message: "Category Created successfully",
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
const editProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const { name, description, images, category, minPrice, maxPrice, subCategory, productType, sizes, flavour, toppings, } = req.body;
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
        if (images)
            productDetails.images = images;
        if (category)
            productDetails.category = category;
        if (minPrice)
            productDetails.minPrice = minPrice;
        if (maxPrice)
            productDetails.maxPrice = maxPrice;
        if (subCategory)
            productDetails.subCategory = subCategory;
        if (sizes)
            productDetails.sizes = sizes;
        if (flavour)
            productDetails.flavour = flavour;
        if (productType)
            productDetails.productType = productType;
        if (toppings)
            productDetails.toppings = toppings;
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
            message: "Category Retrieved successfully",
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
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;
        const totalProducts = yield Product_model_1.default.countDocuments();
        const productDetails = yield Product_model_1.default.find()
            .skip(skip)
            .limit(limit)
            .exec();
        const totalPages = Math.ceil(totalProducts / limit);
        return res.json({
            error: false,
            productDetails,
            currentPage: page,
            totalPages,
            totalProducts,
            message: "All products retrieved successfully",
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
