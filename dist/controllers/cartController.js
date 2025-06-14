"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeLocalCart = exports.getCart = exports.clearCart = exports.removeCartItem = exports.updateCartItem = exports.addToCart = void 0;
const Cart_model_1 = __importDefault(require("../models/Cart.model"));
const Product_model_1 = __importDefault(require("../models/Product.model"));
const addToCart = async (req, res) => {
    try {
        const { product, size, toppings, flavour, shape, dateNeeded, details, quantity, } = req.body;
        const userId = req.id;
        if (!userId) {
            return res
                .status(401)
                .json({ error: true, message: "Unauthorized. Please log in." });
        }
        // Check if the product exists
        const checkProduct = await Product_model_1.default.findOne({ _id: product });
        if (!checkProduct) {
            return res
                .status(404)
                .json({ error: true, message: "Product not found." });
        }
        // Validate required fields
        if (checkProduct.productType === "preorder") {
            if (!shape || !size || !toppings || !flavour) {
                return res
                    .status(400)
                    .json({ message: "All required fields must be provided." });
            }
            // if (!size || !toppings || !flavour || !quantity) {
            //   return res
            //     .status(400)
            //     .json({ error: true, message: "All fields are required." });
            // }
        }
        let cart = await Cart_model_1.default.findOne({ userId });
        if (!cart) {
            // Create new cart if user has no cart yet
            cart = new Cart_model_1.default({
                userId,
                products: [
                    {
                        product,
                        size,
                        toppings,
                        flavour,
                        shape,
                        dateNeeded,
                        details,
                        quantity,
                    },
                ],
            });
        }
        else {
            // Check if the product already exists in the cart
            const existingProduct = cart.products.find((p) => p.product.toString() === product);
            if (existingProduct) {
                existingProduct.quantity += 1;
            }
            else {
                cart.products.push({
                    product,
                    size,
                    toppings,
                    flavour,
                    shape,
                    dateNeeded,
                    details,
                    quantity,
                });
            }
        }
        await cart.save();
        const populatedCart = await Cart_model_1.default.findOne({ userId })
            .populate("products.product") // Populate product field with full product details
            .exec();
        return res.status(200).json({
            error: false,
            message: "Product added to cart successfully.",
            cart: populatedCart,
        });
    }
    catch (error) {
        console.error("Error adding to cart:", error);
        return res
            .status(500)
            .json({ error: true, message: "Internal server error.", err: error });
    }
};
exports.addToCart = addToCart;
const updateCartItem = async (req, res) => {
    try {
        const { product, quantity } = req.body;
        const userId = req.id;
        if (!userId)
            return res.status(401).json({ error: true, message: "Unauthorized." });
        const cart = await Cart_model_1.default.findOne({ userId });
        if (!cart)
            return res.status(404).json({ error: true, message: "Cart not found." });
        const cartProduct = cart.products.find((p) => p.product.toString() === product);
        if (!cartProduct)
            return res
                .status(404)
                .json({ error: true, message: "Product not found in cart." });
        cartProduct.quantity = quantity;
        await cart.save();
        return res
            .status(200)
            .json({ error: false, message: "Cart updated successfully.", cart });
    }
    catch (error) {
        return res
            .status(500)
            .json({ error: true, message: "Internal server error.", err: error });
    }
};
exports.updateCartItem = updateCartItem;
const removeCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.id;
        if (!userId)
            return res.status(401).json({ error: true, message: "Unauthorized." });
        const cart = await Cart_model_1.default.findOne({ userId });
        if (!cart)
            return res.status(404).json({ error: true, message: "Cart not found." });
        cart.products = cart.products.filter((p) => p.product.toString() !== productId);
        await cart.save();
        return res
            .status(200)
            .json({ error: false, message: "Product removed from cart.", cart });
    }
    catch (error) {
        return res
            .status(500)
            .json({ error: true, message: "Internal server error.", err: error });
    }
};
exports.removeCartItem = removeCartItem;
const clearCart = async (req, res) => {
    try {
        const userId = req.id;
        if (!userId)
            return res.status(401).json({ error: true, message: "Unauthorized." });
        await Cart_model_1.default.findOneAndDelete({ userId });
        return res
            .status(200)
            .json({ error: false, message: "Cart cleared successfully." });
    }
    catch (error) {
        return res
            .status(500)
            .json({ error: true, message: "Internal server error.", err: error });
    }
};
exports.clearCart = clearCart;
const getCart = async (req, res) => {
    try {
        const userId = req.id;
        if (!userId)
            return res.status(401).json({ error: true, message: "Unauthorized." });
        const cart = await Cart_model_1.default.findOne({ userId }).populate("products.product");
        return res.status(200).json({ error: false, cart });
    }
    catch (error) {
        return res
            .status(500)
            .json({ error: true, message: "Internal server error.", err: error });
    }
};
exports.getCart = getCart;
// New Merge Cart Endpoint
const mergeLocalCart = async (req, res) => {
    console.log("Merge Cart Request Body:", req.body);
    console.log("User ID:", req.id);
    try {
        const userId = req.id;
        const localCartItems = req.body.localCartItems;
        if (!userId) {
            return res
                .status(401)
                .json({ error: true, message: "Unauthorized. Please log in." });
        }
        // Find or create user's cart
        let cart = await Cart_model_1.default.findOne({ userId });
        if (!cart) {
            cart = new Cart_model_1.default({ userId, products: [] });
        }
        // If no local cart items, return existing cart
        if (!localCartItems ||
            !Array.isArray(localCartItems) ||
            localCartItems.length === 0) {
            const populatedCart = await Cart_model_1.default.findOne({ userId }).populate("products.product");
            return res.status(200).json({
                error: false,
                message: "No local cart items to merge.",
                cart: populatedCart || { products: [] },
            });
        }
        // Reset cart products before merging
        cart.products = [];
        // Validate and process each local cart item
        for (const item of localCartItems) {
            // Check if the product exists
            const checkProduct = await Product_model_1.default.findOne({ _id: item.product });
            if (!checkProduct) {
                continue; // Skip invalid products
            }
            // Add product to cart
            cart.products.push({
                product: item.product,
                size: item.size,
                toppings: item.toppings,
                flavour: item.flavour,
                shape: item.shape,
                dateNeeded: item.dateNeeded,
                details: item.details,
                quantity: item.quantity,
            });
        }
        // Save the updated cart
        await cart.save();
        // Populate and return the updated cart
        const populatedCart = await Cart_model_1.default.findOne({ userId })
            .populate("products.product")
            .exec();
        return res.status(200).json({
            error: false,
            message: "Local cart merged successfully.",
            cart: populatedCart,
        });
    }
    catch (error) {
        console.error("Error merging local cart:", error);
        return res.status(500).json({
            error: true,
            message: "Internal server error during cart merge.",
            err: error,
        });
    }
};
exports.mergeLocalCart = mergeLocalCart;
//# sourceMappingURL=cartController.js.map