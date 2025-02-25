"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const FeeSchema = new mongoose_1.Schema({
    subTotal: { type: Number, required: true },
    total: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
});
const OrderSchema = new mongoose_1.Schema({
    firstName: { type: String, require: [true, "Please provide billing first name to complete this process"] },
    lastName: { type: String, require: [true, "Please provide billing last name to complete this process"] },
    email: { type: String, require: [true, "Please provide billing email to complete this process"] },
    country: { type: String, require: [true, "Please provide country to complete this process"] },
    state: { type: String, require: [true, "Please provide city or town to complete this process"] },
    cityOrTown: { type: String, require: [true, "Please provide city or town to complete this process"] },
    streetAddress: { type: String, require: [true, "Please provide street address to complete this process"] },
    phoneNumber: { type: String, require: [true, "Please provide phone number to complete this process"] },
    orderedItems: {
        subCategories: {
            type: [mongoose_1.Schema.Types.ObjectId],
            ref: 'Product',
            required: true
        },
    },
    fee: { type: FeeSchema, require: [true, "Please provide all the necessary fees to complete this process"] },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    orderStatus: {
        type: String,
        enum: ["pending", "completed", "cancelled"],
        default: "pending"
    },
    orderId: { type: String, required: true }
}, {
    timestamps: true
});
const Order = (0, mongoose_1.model)("Orders", OrderSchema);
exports.default = Order;
