"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const cartSchema = new mongoose_1.Schema({
    size: { type: String, require: [true, "Please provide cake size"] },
    toppings: {
        type: String,
        require: [true, "Please provide cake toppings"],
    },
    dateNeeded: {
        type: String,
        require: [true, "Please provide when the cake is needed"],
    },
    details: { type: String, require: [true, "Please provide cake details"] },
    quantity: { type: Number, required: [true, "Please provide the quantity for the product"] }
}, {
    timestamps: true
});
const Cart = (0, mongoose_1.model)("Cart", cartSchema);
exports.default = Cart;
