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
    const { name, description, images, category, minPrice, maxPrice, shapes, sizes, fillings, toppings, } = req.body;
    if (!name ||
        !description ||
        !images ||
        !category ||
        !minPrice ||
        !maxPrice ||
        !shapes ||
        !sizes ||
        !fillings ||
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
            shapes,
            sizes,
            fillings,
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
            eroor: true,
            err,
            message: "Internal server error",
        });
    }
});
exports.createProduct = createProduct;
const editProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId } = req.params;
    const { name, description, images, category, minPrice, maxPrice, shapes, sizes, fillings, toppings, } = req.body;
    try {
        const categoryDetails = yield Product_model_1.default.findOne({ _id: categoryId });
        if (!categoryDetails) {
            return res.status(400).json({
                error: true,
                message: "category not found",
            });
        }
        if (name)
            categoryDetails.name = name;
        if (description)
            categoryDetails.description = description;
        if (images)
            categoryDetails.images = images;
        if (category)
            categoryDetails.category = category;
        if (minPrice)
            categoryDetails.minPrice = minPrice;
        if (maxPrice)
            categoryDetails.maxPrice = maxPrice;
        if (shapes)
            categoryDetails.shapes = shapes;
        if (sizes)
            categoryDetails.sizes = sizes;
        if (fillings)
            categoryDetails.fillings = fillings;
        if (toppings)
            categoryDetails.toppings = toppings;
        yield categoryDetails.save();
        res.json({
            error: false,
            categoryDetails,
            message: "Category updated successfully",
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
        const { categoryId } = req.params;
        const categoryDetails = yield Product_model_1.default.findOne({ _id: categoryId });
        if (!categoryDetails) {
            return res.status(400).json({
                error: true,
                message: "category not found",
            });
        }
        return res.json({
            error: false,
            categoryDetails,
            message: "Category Retrieved succcessfully",
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
        const categoryDetails = yield Product_model_1.default.find();
        return res.json({
            error: false,
            categoryDetails,
            message: "All Categories Retrieved succcessfully",
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
    const { categoryId } = req.params;
    try {
        const categoryDetails = yield Product_model_1.default.deleteOne({ _id: categoryId });
        if (!categoryDetails) {
            return res.status(400).json({
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
exports.deleteProduct = deleteProduct;
