"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const BillingInfoSchema = new mongoose_1.Schema({
    firstName: { type: String, required: [true, "Please provide billing first name to complete this process"] },
    lastName: { type: String, required: [true, "Please provide billing last name to complete this process"] },
    email: { type: String, required: [true, "Please provide billing email to complete this process"] },
    country: { type: String, required: [true, "Please provide country to complete this process"] },
    cityOrTown: { type: String, required: [true, "Please provide city or town to complete this process"] },
    state: { type: String, required: [true, "Please provide state to complete this process"] },
    streetAddress: { type: String, required: [true, "Please provide street address to complete this process"] },
    phoneNumber: { type: String, required: [true, "Please provide phone number to complete this process"] },
    defaultBillingInfo: { type: Boolean, default: false },
}, { _id: true }); // Ensure each entry has a unique _id
const UserSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, requried: true },
    billingInfo: [BillingInfoSchema], // Now an array of billing information
    favorites: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Product' }]
}, {
    timestamps: true
});
const User = mongoose_1.default.model("User", UserSchema);
exports.default = User;
