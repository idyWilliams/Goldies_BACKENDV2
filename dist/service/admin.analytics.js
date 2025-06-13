"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesAnalyticsService = void 0;
// src/services/SalesAnalyticsService.ts
const date_fns_1 = require("date-fns");
const User_model_1 = __importDefault(require("../models/User.model"));
const Order_model_1 = __importDefault(require("../models/Order.model"));
const Category_model_1 = __importDefault(require("../models/Category.model"));
const Product_model_1 = __importDefault(require("../models/Product.model"));
class SalesAnalyticsService {
    // Get total summary data with period comparison
    async getTotalSummary(period = "month") {
        const today = new Date();
        let currentPeriodStart;
        let currentPeriodEnd;
        let previousPeriodStart;
        let previousPeriodEnd;
        switch (period) {
            case "all":
                try {
                    const firstOrder = await Order_model_1.default.findOne().sort({ createdAt: 1 });
                    // Check if firstOrder exists and has createdAt property
                    currentPeriodStart =
                        firstOrder && firstOrder.createdAt
                            ? new Date(firstOrder.createdAt)
                            : new Date(2020, 0, 1); // default to Jan 1, 2020 if no orders
                    currentPeriodEnd = (0, date_fns_1.endOfDay)(today);
                    // For comparison, use the same time span but previous period
                    const timeDiff = today.getTime() - currentPeriodStart.getTime();
                    previousPeriodStart = new Date(currentPeriodStart.getTime() - timeDiff);
                    previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1); // day before current period starts
                }
                catch (error) {
                    console.error("Error determining all-time period:", error);
                    // Fallback values if there's an error
                    currentPeriodStart = new Date(2020, 0, 1);
                    currentPeriodEnd = (0, date_fns_1.endOfDay)(today);
                    previousPeriodStart = new Date(2015, 0, 1);
                    previousPeriodEnd = new Date(2019, 11, 31);
                }
                break;
            case "week":
                currentPeriodStart = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(today, 6));
                currentPeriodEnd = (0, date_fns_1.endOfDay)(today);
                previousPeriodStart = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(today, 13));
                previousPeriodEnd = (0, date_fns_1.endOfDay)((0, date_fns_1.subDays)(today, 7));
                break;
            case "month":
                currentPeriodStart = (0, date_fns_1.startOfMonth)(today);
                currentPeriodEnd = (0, date_fns_1.endOfDay)(today);
                previousPeriodStart = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(today, 1));
                previousPeriodEnd = (0, date_fns_1.endOfMonth)((0, date_fns_1.subMonths)(today, 1));
                break;
            case "year":
                currentPeriodStart = (0, date_fns_1.startOfYear)(today);
                currentPeriodEnd = (0, date_fns_1.endOfDay)(today);
                previousPeriodStart = (0, date_fns_1.startOfYear)((0, date_fns_1.subMonths)(today, 12));
                previousPeriodEnd = (0, date_fns_1.endOfYear)((0, date_fns_1.subMonths)(today, 12));
                break;
            default: // Default to 'all' if invalid period
                try {
                    const defaultFirstOrder = await Order_model_1.default.findOne().sort({
                        createdAt: 1,
                    });
                    currentPeriodStart =
                        defaultFirstOrder && defaultFirstOrder.createdAt
                            ? new Date(defaultFirstOrder.createdAt)
                            : new Date(2020, 0, 1);
                    currentPeriodEnd = (0, date_fns_1.endOfDay)(today);
                    const defaultTimeDiff = today.getTime() - currentPeriodStart.getTime();
                    previousPeriodStart = new Date(currentPeriodStart.getTime() - defaultTimeDiff);
                    previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1);
                }
                catch (error) {
                    console.error("Error in default case:", error);
                    // Fallback values
                    currentPeriodStart = new Date(2020, 0, 1);
                    currentPeriodEnd = (0, date_fns_1.endOfDay)(today);
                    previousPeriodStart = new Date(2015, 0, 1);
                    previousPeriodEnd = new Date(2019, 11, 31);
                }
        }
        // Current period data
        const currentPeriodOrders = await this.getOrdersInPeriod(currentPeriodStart, currentPeriodEnd);
        // Previous period data for comparison
        const previousPeriodOrders = await this.getOrdersInPeriod(previousPeriodStart, previousPeriodEnd);
        // Calculate metrics for current period
        const currentTotalSales = this.calculateTotalSales(currentPeriodOrders);
        const currentTotalOrders = currentPeriodOrders.length;
        const currentNewCustomers = await this.countNewCustomers(currentPeriodStart, currentPeriodEnd);
        // Calculate average order value for current period
        const currentAverageOrderValue = currentTotalOrders > 0 ? currentTotalSales / currentTotalOrders : 0;
        // Calculate metrics for previous period
        const previousTotalSales = this.calculateTotalSales(previousPeriodOrders);
        const previousTotalOrders = previousPeriodOrders.length;
        const previousNewCustomers = await this.countNewCustomers(previousPeriodStart, previousPeriodEnd);
        // Calculate average order value for previous period
        const previousAverageOrderValue = previousTotalOrders > 0 ? previousTotalSales / previousTotalOrders : 0;
        // Calculate percentage changes
        const salesPercentChange = this.calculatePercentChange(currentTotalSales, previousTotalSales);
        const ordersPercentChange = this.calculatePercentChange(currentTotalOrders, previousTotalOrders);
        const customersPercentChange = this.calculatePercentChange(currentNewCustomers, previousNewCustomers);
        const aovPercentChange = this.calculatePercentChange(currentAverageOrderValue, previousAverageOrderValue);
        return {
            period: {
                type: period,
                current: {
                    start: (0, date_fns_1.format)(currentPeriodStart, "yyyy-MM-dd"),
                    end: (0, date_fns_1.format)(currentPeriodEnd, "yyyy-MM-dd"),
                },
                previous: {
                    start: (0, date_fns_1.format)(previousPeriodStart, "yyyy-MM-dd"),
                    end: (0, date_fns_1.format)(previousPeriodEnd, "yyyy-MM-dd"),
                },
            },
            totalSales: {
                value: currentTotalSales,
                percentChange: salesPercentChange,
                previous: previousTotalSales,
            },
            totalOrders: {
                value: currentTotalOrders,
                percentChange: ordersPercentChange,
                previous: previousTotalOrders,
            },
            newCustomers: {
                value: currentNewCustomers,
                percentChange: customersPercentChange,
                previous: previousNewCustomers,
            },
            averageOrderValue: {
                value: currentAverageOrderValue,
                percentChange: aovPercentChange,
                previous: previousAverageOrderValue,
            },
        };
    }
    // Get monthly revenue data for chart
    async getRevenueReport() {
        const currentYear = new Date().getFullYear();
        const monthlyData = [];
        for (let month = 0; month < 12; month++) {
            const startDate = new Date(currentYear, month, 1);
            const endDate = (0, date_fns_1.endOfMonth)(startDate);
            const orders = await this.getOrdersInPeriod(startDate, endDate);
            const totalRevenue = this.calculateTotalSales(orders);
            monthlyData.push({
                month: (0, date_fns_1.format)(startDate, "MMM"),
                revenue: totalRevenue,
            });
        }
        return monthlyData;
    }
    // Helper methods
    async getOrdersInPeriod(startDate, endDate) {
        return Order_model_1.default.find({
            createdAt: { $gte: startDate, $lte: endDate },
            orderStatus: { $ne: "cancelled" }, // Exclude cancelled orders
        });
    }
    calculateTotalSales(orders) {
        return orders.reduce((total, order) => total + order.fee.total, 0);
    }
    async countNewCustomers(startDate, endDate) {
        // Count users created during this period
        const newUsers = await User_model_1.default.countDocuments({
            createdAt: { $gte: startDate, $lte: endDate },
        });
        return newUsers;
    }
    calculatePercentChange(current, previous) {
        if (previous === 0)
            return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    }
    // Get yearly revenue data
    async getYearlyRevenue() {
        const currentYear = new Date().getFullYear();
        const startDate = new Date(currentYear, 0, 1); // January 1st
        const endDate = new Date(currentYear, 11, 31); // December 31st
        const orders = await this.getOrdersInPeriod(startDate, endDate);
        const totalRevenue = this.calculateTotalSales(orders);
        return {
            year: currentYear,
            totalRevenue,
        };
    }
    // Get best-selling products
    async getBestSellingProducts(limit = 5) {
        // Aggregate to find products with most orders
        const topProducts = await Order_model_1.default.aggregate([
            { $unwind: "$orderedItems" },
            {
                $group: {
                    _id: "$orderedItems.product",
                    totalQuantity: { $sum: "$orderedItems.quantity" },
                    totalSales: { $sum: "$fee.total" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails",
                },
            },
            { $unwind: "$productDetails" },
            {
                $project: {
                    _id: 1,
                    productName: "$productDetails.name",
                    totalQuantity: 1,
                    totalSales: 1,
                    count: 1,
                },
            },
        ]);
        return topProducts;
    }
    async getCategoryDistribution() {
        // Get all cake categories
        const cakeCategories = await Category_model_1.default.find({ status: true });
        const categoryData = [];
        for (const category of cakeCategories) {
            // Count products in this category
            const productCount = await Product_model_1.default.countDocuments({
                category: category._id,
                status: "active",
            });
            categoryData.push({
                name: category.name,
                value: productCount,
            });
        }
        return categoryData;
    }
    // Get monthly order analytics
    async getOrderAnalytics() {
        const currentYear = new Date().getFullYear();
        const monthlyData = [];
        for (let month = 0; month < 12; month++) {
            const startDate = new Date(currentYear, month, 1);
            const endDate = (0, date_fns_1.endOfMonth)(startDate);
            const orderCount = await Order_model_1.default.countDocuments({
                createdAt: { $gte: startDate, $lte: endDate },
                orderStatus: { $ne: "cancelled" },
            });
            monthlyData.push({
                month: (0, date_fns_1.format)(startDate, "MMM"),
                orders: orderCount,
            });
        }
        return monthlyData;
    }
    // Get monthly customer analytics
    async getCustomerAnalytics() {
        const currentYear = new Date().getFullYear();
        const monthlyData = [];
        for (let month = 0; month < 12; month++) {
            const startDate = new Date(currentYear, month, 1);
            const endDate = (0, date_fns_1.endOfMonth)(startDate);
            const newUserCount = await User_model_1.default.countDocuments({
                createdAt: { $gte: startDate, $lte: endDate },
            });
            monthlyData.push({
                month: (0, date_fns_1.format)(startDate, "MMM"),
                customers: newUserCount,
            });
        }
        return monthlyData;
    }
    // Get top product sales distribution
    async getTopProductSalesDistribution() {
        // Get top products by sales quantity
        const topProducts = await Order_model_1.default.aggregate([
            { $unwind: "$orderedItems" },
            {
                $group: {
                    _id: "$orderedItems.product",
                    totalQuantity: { $sum: "$orderedItems.quantity" },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails",
                },
            },
            { $unwind: "$productDetails" },
            {
                $lookup: {
                    from: "categories",
                    localField: "productDetails.category",
                    foreignField: "_id",
                    as: "categoryDetails",
                },
            },
            { $unwind: "$categoryDetails" },
            {
                $project: {
                    _id: 1,
                    productName: "$productDetails.name",
                    categoryName: "$categoryDetails.name",
                    totalQuantity: 1,
                },
            },
        ]);
        // Group by category for pie chart
        const categoryMap = new Map();
        topProducts.forEach((product) => {
            const categoryName = product.categoryName;
            if (categoryMap.has(categoryName)) {
                categoryMap.set(categoryName, categoryMap.get(categoryName) + product.totalQuantity);
            }
            else {
                categoryMap.set(categoryName, product.totalQuantity);
            }
        });
        const topProductData = Array.from(categoryMap.entries()).map(([name, value]) => ({
            name,
            value,
        }));
        return topProductData;
    }
    async getExtendedDashboardData(period = "all") {
        const [totalSummary, revenueReport, categoryDistribution, orderAnalytics, customerAnalytics, topProductSales,] = await Promise.all([
            this.getTotalSummary(period),
            this.getRevenueReport(),
            this.getCategoryDistribution(),
            this.getOrderAnalytics(),
            this.getCustomerAnalytics(),
            this.getTopProductSalesDistribution(),
        ]);
        return {
            totalSummary,
            revenueReport,
            categoryDistribution,
            orderAnalytics,
            customerAnalytics,
            topProductSales,
        };
    }
}
exports.SalesAnalyticsService = SalesAnalyticsService;
exports.default = new SalesAnalyticsService();
//# sourceMappingURL=admin.analytics.js.map