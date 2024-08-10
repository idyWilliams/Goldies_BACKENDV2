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
exports.getSubCategory = exports.getAllSubCategory = exports.updateSubCategory = exports.createSubCategory = void 0;
const SubCategory_model_1 = __importDefault(require("../models/SubCategory.model"));
// Create SubCategories
const createSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, image, status } = req.body;
    try {
        const subCategory = yield SubCategory_model_1.default.create({
            name,
            description,
            image,
            status,
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
            messaage: "Internal server error, Please try again",
        });
    }
});
exports.createSubCategory = createSubCategory;
// Update subCategory
const updateSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { subCategoryId } = req.params;
    const { name, description, image, status } = req.body;
    try {
        const subCategory = yield SubCategory_model_1.default.findOne({ _id: subCategoryId });
        // if (!name || !description || !image || !status) {
        //     return res.status()
        // }
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
        if (status)
            subCategory.status = status;
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
            messaage: "Internal server error, Please try again",
        });
    }
});
exports.updateSubCategory = updateSubCategory;
// Get all subCategory
const getAllSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subCategories = yield SubCategory_model_1.default.find();
        return res.status(200).json({
            error: true,
            subCategories,
            message: "All sub Categories fetched successfully",
        });
    }
    catch (err) {
        return res.status(500).json({
            error: true,
            err,
            messaage: "Internal server error, Please try again",
        });
    }
});
exports.getAllSubCategory = getAllSubCategory;
// Get sub category
const getSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { subCategoryId } = req.params;
    try {
        const subCategory = yield SubCategory_model_1.default.findOne({ _id: subCategoryId });
        if (!subCategory) {
            return res.status(200).json({
                error: true,
                message: "subCategory not found, please try again with the correct ID",
            });
        }
        return res.status(200).json({
            error: true,
            subCategory,
            message: "subCategory data fetched successfully",
        });
    }
    catch (err) {
        return res.status(500).json({
            error: true,
            err,
            messaage: "Internal server error, Please try again",
        });
    }
});
exports.getSubCategory = getSubCategory;
// delete subCategory
const deleteSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { subCategoryId } = req.params;
    try {
        const subCategory = yield SubCategory_model_1.default.deleteOne({ _id: subCategoryId });
        if (!subCategory) {
            return res.status(404).json({
                error: true,
                message: "SubCategory not found",
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
