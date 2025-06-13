"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalyticsSummary = void 0;
const Category_model_1 = __importDefault(require("../models/Category.model"));
const Order_model_1 = __importDefault(require("../models/Order.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const getAnalyticsSummary = async () => {
    const cakesDelivered = await Order_model_1.default.countDocuments();
    const verifiedCustomers = await User_model_1.default.countDocuments();
    const recipesCount = await Category_model_1.default.countDocuments();
    return {
        cakesDelivered,
        verifiedCustomers,
        recipesCount,
    };
};
exports.getAnalyticsSummary = getAnalyticsSummary;
//# sourceMappingURL=analyticsServices.js.map