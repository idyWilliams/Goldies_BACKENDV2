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
exports.getProductBySlug = exports.getProduct = exports.getAllProducts = exports.deleteProduct = exports.editProduct = exports.createProduct = void 0;
const Product_model_1 = __importDefault(require("../models/Product.model"));
const Category_model_1 = __importDefault(require("../models/Category.model"));
const SubCategory_model_1 = __importDefault(require("../models/SubCategory.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, shapes, sizes, productType, toppings, category, subCategories, minPrice, maxPrice, images, flavour, status } = req.body;
        if (!name || !description || !category || !subCategories || !minPrice || !maxPrice || !status) {
            return res.status(400).json({ message: "All required fields must be provided." });
        }
        if (productType === 'preorder') {
            if (!shapes || !sizes || !toppings || !flavour) {
                return res.status(400).json({ message: "All required fields must be provided." });
            }
        }
        // Check if category ID is valid
        if (!mongoose_1.default.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ message: "Invalid category ID format." });
        }
        // Convert and validate subCategory IDs
        const subCategoryIds = subCategories.map((id) => mongoose_1.default.Types.ObjectId.isValid(id) ? new mongoose_1.default.Types.ObjectId(id) : null).filter((id) => id !== null);
        if (subCategoryIds.length !== subCategories.length) {
            return res.status(400).json({ message: "One or more subcategories have an invalid ID format." });
        }
        // Check if category exists
        const existingCategory = yield Category_model_1.default.findOne({ _id: category });
        if (!existingCategory) {
            return res.status(404).json({ message: "Category not found." });
        }
        // Check if subCategories exist
        const existingSubCategories = yield SubCategory_model_1.default.find({ _id: { $in: subCategoryIds } });
        if (existingSubCategories.length !== subCategories.length) {
            return res.status(400).json({ message: "One or more subcategories do not exist." });
        }
        // Ensure subCategories belong to the specified category
        const invalidSubCategories = existingSubCategories.filter((subCategory) => subCategory.categoryId.toString() !== category);
        if (invalidSubCategories.length > 0) {
            return res.status(400).json({ message: "Some subcategories do not belong to the provided category." });
        }
        const slug = (0, slugify_1.default)(name, { lower: true, strict: true });
        // Create new product
        const newProduct = new Product_model_1.default({
            name,
            description,
            shapes,
            sizes,
            productType,
            toppings,
            category,
            subCategories: subCategoryIds,
            minPrice,
            maxPrice,
            images,
            flavour,
            status,
            productCode: generateUniqueId(),
            slug
        });
        // Save product to database
        const product = yield newProduct.save();
        const productDetails = yield Product_model_1.default.findOne({ _id: product.id }).populate('category').populate('subCategories');
        return res.status(201).json({ message: "Product created successfully", product: productDetails });
    }
    catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({ message: "Internal Server Error" });
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
    const { name, description, shapes, sizes, productType, toppings, category, subCategories, minPrice, maxPrice, images, flavour, status } = req.body;
    try {
        const productDetails = yield Product_model_1.default.findOne({ _id: productId });
        if (!productDetails) {
            return res.status(400).json({
                error: true,
                message: "product not found",
            });
        }
        // if (name) productDetails.name = name;
        if (name) {
            productDetails.name = name;
            productDetails.slug = (0, slugify_1.default)(name, { lower: true, strict: true }); // Regenerate the slug if name is changed
        }
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
        if (subCategories)
            productDetails.subCategories = subCategories;
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
        const productDetails = yield Product_model_1.default.findOne({ _id: productId }).populate('category').populate('subCategories');
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
        // Filter by category
        if (categoryIds) {
            filters["category"] = { $in: categoryIds.split(",") }; // category is just an ObjectId
        }
        // Filter by subCategory (ensure it's querying against the subCategories array of ObjectIds)
        if (subCategoryIds) {
            filters["subCategories"] = {
                $in: subCategoryIds.split(",").map(id => new mongoose_1.default.Types.ObjectId(id)), // Convert to ObjectIds
            };
        }
        // Filter by price range
        if (minPrice || maxPrice) {
            filters.price = {};
            if (minPrice)
                filters.price.$gte = parseFloat(minPrice);
            if (maxPrice)
                filters.price.$lte = parseFloat(maxPrice);
        }
        // Filter by search query
        if (searchQuery && searchQuery.trim() !== "") {
            filters.$or = [
                { name: { $regex: searchQuery, $options: "i" } },
                { description: { $regex: searchQuery, $options: "i" } },
                { productCode: { $regex: searchQuery, $options: "i" } },
            ];
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        // Ensure `sortBy` is a valid string and cast it
        const validSortBy = typeof sortBy === 'string' ? sortBy : 'createdAt';
        const sortOrder = order === "asc" ? 1 : -1;
        // Apply sorting and populate category and subCategories
        const productDetails = yield Product_model_1.default.find(filters)
            .populate('category') // Populate the category
            .populate('subCategories') // Populate subCategories
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
const getProductBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params; // Get the slug from the URL parameter
    try {
        // Find the product by slug
        const product = yield Product_model_1.default.findOne({ slug: slug }).populate('category').populate('subCategories');
        if (!product) {
            return res.status(404).json({
                error: true,
                message: "Product not found with the given slug",
            });
        }
        return res.status(200).json({
            error: false,
            message: "Product retrieved successfully",
            product,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error",
            err: error,
        });
    }
});
exports.getProductBySlug = getProductBySlug;
