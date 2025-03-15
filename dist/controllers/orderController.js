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
exports.getSpecificUserOrder = exports.deleteOrder = exports.getOrder = exports.getAllOrders = exports.updateOrderStatus = exports.createOrder = void 0;
const Order_model_1 = __importDefault(require("../models/Order.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, country, state, cityOrTown, streetAddress, phoneNumber, orderedItems, fee } = req.body;
    try {
        // Validate required fields
        if (!firstName || !lastName || !email || !country || !state || !cityOrTown || !streetAddress || !phoneNumber || !orderedItems || !fee) {
            return res.status(400).json({
                error: true,
                message: "All order information fields are required."
            });
        }
        console.log("User ID from token:", req.id);
        const user = req.id;
        const userDetails = yield User_model_1.default.findOne({ _id: user });
        if (!userDetails) {
            return res.status(404).json({
                error: true,
                message: "User not found, please login and try again"
            });
        }
        // Generate a unique order ID
        const orderId = generateUniqueId();
        // Create the order, storing only product._id and other fields separately
        const newOrder = new Order_model_1.default({
            user,
            firstName,
            lastName,
            email,
            country,
            state,
            cityOrTown,
            streetAddress,
            phoneNumber,
            orderedItems,
            fee,
            orderId
        });
        // Save the order
        yield newOrder.save();
        // Populate orderedItems with full product details after saving
        const populatedOrder = yield Order_model_1.default.findById(newOrder._id).populate("orderedItems.product").exec();
        return res.status(201).json({
            error: false,
            message: "Order created successfully",
            order: populatedOrder,
        });
    }
    catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({
            error: true,
            message: "Internal server error, please try again",
            err: error,
        });
    }
});
exports.createOrder = createOrder;
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
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderStatus } = req.body;
    const { orderId } = req.params;
    try {
        const isValidObjectId = mongoose_1.default.Types.ObjectId.isValid(orderId);
        const queryConditions = isValidObjectId
            ? [{ _id: orderId }, { orderId: orderId }] // Match both _id and orderId
            : [{ orderId: orderId }]; // Match only orderId
        const order = yield Order_model_1.default.findOne({ $or: queryConditions });
        if (!order) {
            return res.status(404).json({
                error: true,
                message: "Order details not found, please provide the correct order id"
            });
        }
        if (orderStatus)
            order.orderStatus = orderStatus;
        yield order.save();
        return res.status(200).json({
            error: false,
            updatedOrder: order,
            message: "Order updated successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, please try again"
        });
    }
});
exports.updateOrderStatus = updateOrderStatus;
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield Order_model_1.default.find().sort({ createdAt: -1 });
        return res.status(200).json({
            error: false,
            orders,
            message: "All order data fetched successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, please try again"
        });
    }
});
exports.getAllOrders = getAllOrders;
const getOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.params;
    try {
        const isValidObjectId = mongoose_1.default.Types.ObjectId.isValid(orderId);
        const queryConditions = isValidObjectId
            ? [{ _id: orderId }, { orderId: orderId }] // Match both _id and orderId
            : [{ orderId: orderId }]; // Match only orderId
        const order = yield Order_model_1.default.findOne({ $or: queryConditions }).populate('orderedItems.product');
        if (!order) {
            return res.status(404).json({
                error: true,
                message: "Order not found, Please provide the correct order id"
            });
        }
        return res.status(200).json({
            error: false,
            order,
            message: "Order details fetched successfully"
        });
    }
    catch (error) {
        console.error("Error retrieving user:", error);
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, please try again"
        });
    }
});
exports.getOrder = getOrder;
const deleteOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const isValidObjectId = mongoose_1.default.Types.ObjectId.isValid(orderId);
        const queryConditions = isValidObjectId
            ? [{ _id: orderId }, { orderId: orderId }] // Match both _id and orderId
            : [{ orderId: orderId }]; // Match only orderId
        const result = yield Order_model_1.default.deleteOne({ $or: queryConditions });
        if (!result) {
            return res.status(404).json({
                error: true,
                message: "Order not found, Please provide the correct order id"
            });
        }
        return res.status(200).json({
            error: false,
            message: "Order details deleted successfully"
        });
    }
    catch (error) {
        console.error("Error retrieving user:", error);
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, please try again"
        });
    }
});
exports.deleteOrder = deleteOrder;
const getSpecificUserOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.id;
        const userOrder = yield Order_model_1.default.find({ user }).sort({ createdAt: -1 });
        const userDetails = yield User_model_1.default.findOne({ _id: user });
        if (!userDetails) {
            return res.status(404).json({
                error: true,
                message: "User not found, please login and try again"
            });
        }
        if (!userOrder) {
            return res.status(404).json({
                error: true,
                message: "No order found for this user"
            });
        }
        return res.status(200).json({
            error: false,
            userOrder,
            message: `${userDetails.firstName} ${userDetails.lastName} orders retrieved successfully`
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, please try again"
        });
    }
});
exports.getSpecificUserOrder = getSpecificUserOrder;
