"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAnalytics_controller_1 = __importDefault(require("../controllers/adminAnalytics.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect);
router.use((0, auth_middleware_1.authorize)("admin", "super_admin"));
router.get("/today-summary", adminAnalytics_controller_1.default.getTodaySummary);
router.get("/revenue-report", adminAnalytics_controller_1.default.getRevenueReport);
router.get("/category-distribution", adminAnalytics_controller_1.default.getCategoryDistribution);
router.get("/order-analytics", adminAnalytics_controller_1.default.getOrderAnalytics);
router.get("/customer-analytics", adminAnalytics_controller_1.default.getCustomerAnalytics);
router.get("/top-product-sales", adminAnalytics_controller_1.default.getTopProductSales);
// Dashboard data routes
router.get("/dashboard", adminAnalytics_controller_1.default.getDashboardData);
router.get("/extended-dashboard", adminAnalytics_controller_1.default.getExtendedDashboardData);
exports.default = router;
