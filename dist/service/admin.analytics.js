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
exports.SalesAnalyticsService = void 0;
// src/services/SalesAnalyticsService.ts
const date_fns_1 = require("date-fns");
const User_model_1 = __importDefault(require("../models/User.model"));
const Order_model_1 = __importDefault(require("../models/Order.model"));
const Category_model_1 = __importDefault(require("../models/Category.model"));
const Product_model_1 = __importDefault(require("../models/Product.model"));
class SalesAnalyticsService {
    // Get today's summary data
    getTodaySummary() {
        return __awaiter(this, void 0, void 0, function* () {
            const today = new Date();
            const yesterday = (0, date_fns_1.subDays)(today, 1);
            // Today's data
            const todayStart = (0, date_fns_1.startOfDay)(today);
            const todayEnd = (0, date_fns_1.endOfDay)(today);
            const todayOrders = yield this.getOrdersInPeriod(todayStart, todayEnd);
            // Yesterday's data for comparison
            const yesterdayStart = (0, date_fns_1.startOfDay)(yesterday);
            const yesterdayEnd = (0, date_fns_1.endOfDay)(yesterday);
            const yesterdayOrders = yield this.getOrdersInPeriod(yesterdayStart, yesterdayEnd);
            // Calculate metrics
            const todayTotalSales = this.calculateTotalSales(todayOrders);
            const todayTotalOrders = todayOrders.length;
            const todayNewCustomers = yield this.countNewCustomers(todayStart, todayEnd);
            // Calculate metrics for yesterday
            const yesterdayTotalSales = this.calculateTotalSales(yesterdayOrders);
            const yesterdayTotalOrders = yesterdayOrders.length;
            const yesterdayNewCustomers = yield this.countNewCustomers(yesterdayStart, yesterdayEnd);
            // Calculate percentage changes
            const salesPercentChange = this.calculatePercentChange(todayTotalSales, yesterdayTotalSales);
            const ordersPercentChange = this.calculatePercentChange(todayTotalOrders, yesterdayTotalOrders);
            const customersPercentChange = this.calculatePercentChange(todayNewCustomers, yesterdayNewCustomers);
            return {
                totalSales: {
                    value: todayTotalSales,
                    percentChange: salesPercentChange,
                    yesterday: yesterdayTotalSales,
                },
                totalOrders: {
                    value: todayTotalOrders,
                    percentChange: ordersPercentChange,
                    yesterday: yesterdayTotalOrders,
                },
                newCustomers: {
                    value: todayNewCustomers,
                    percentChange: customersPercentChange,
                    yesterday: yesterdayNewCustomers,
                },
            };
        });
    }
    // Get monthly revenue data for chart
    getRevenueReport() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentYear = new Date().getFullYear();
            const monthlyData = [];
            for (let month = 0; month < 12; month++) {
                const startDate = new Date(currentYear, month, 1);
                const endDate = (0, date_fns_1.endOfMonth)(startDate);
                const orders = yield this.getOrdersInPeriod(startDate, endDate);
                const totalRevenue = this.calculateTotalSales(orders);
                monthlyData.push({
                    month: (0, date_fns_1.format)(startDate, "MMM"),
                    revenue: totalRevenue,
                });
            }
            return monthlyData;
        });
    }
    // Helper methods
    getOrdersInPeriod(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            return Order_model_1.default.find({
                createdAt: { $gte: startDate, $lte: endDate },
                orderStatus: { $ne: "cancelled" }, // Exclude cancelled orders
            });
        });
    }
    calculateTotalSales(orders) {
        return orders.reduce((total, order) => total + order.fee.total, 0);
    }
    countNewCustomers(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            // Count users created during this period
            const newUsers = yield User_model_1.default.countDocuments({
                createdAt: { $gte: startDate, $lte: endDate },
            });
            return newUsers;
        });
    }
    calculatePercentChange(current, previous) {
        if (previous === 0)
            return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    }
    // Get yearly revenue data
    getYearlyRevenue() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentYear = new Date().getFullYear();
            const startDate = new Date(currentYear, 0, 1); // January 1st
            const endDate = new Date(currentYear, 11, 31); // December 31st
            const orders = yield this.getOrdersInPeriod(startDate, endDate);
            const totalRevenue = this.calculateTotalSales(orders);
            return {
                year: currentYear,
                totalRevenue,
            };
        });
    }
    // Get best-selling products
    getBestSellingProducts() {
        return __awaiter(this, arguments, void 0, function* (limit = 5) {
            // Aggregate to find products with most orders
            const topProducts = yield Order_model_1.default.aggregate([
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
        });
    }
    // Get category distribution for cakes
    //   async getCategoryDistribution() {
    //     // Get all categories and their products
    //     const categories = await Category.find({ status: true });
    //     const categoryData = await Promise.all(
    //       categories.map(async (category) => {
    //         // Count orders that include products from this category
    //         const ordersCount = await Order.aggregate([
    //           { $unwind: "$orderedItems" },
    //           {
    //             $lookup: {
    //               from: "products",
    //               localField: "orderedItems.product",
    //               foreignField: "_id",
    //               as: "product",
    //             },
    //           },
    //           { $unwind: "$product" },
    //           {
    //             $match: {
    //               "product.category": category._id,
    //               orderStatus: { $ne: "cancelled" },
    //             },
    //           },
    //           {
    //             $group: {
    //               _id: null,
    //               count: { $sum: 1 },
    //             },
    //           },
    //         ]);
    //         return {
    //           name: category.name,
    //           value: ordersCount.length > 0 ? ordersCount[0].count : 0,
    //           id: category._id,
    //         };
    //       })
    //     );
    //     return categoryData;
    //   }
    // Get category distribution for cakes
    getCategoryDistribution() {
        return __awaiter(this, void 0, void 0, function* () {
            // Get all cake categories
            const cakeCategories = yield Category_model_1.default.find({ status: true });
            const categoryData = [];
            for (const category of cakeCategories) {
                // Count products in this category
                const productCount = yield Product_model_1.default.countDocuments({
                    category: category._id,
                    status: "active",
                });
                categoryData.push({
                    name: category.name,
                    value: productCount,
                });
            }
            return categoryData;
        });
    }
    // Get monthly order counts for the current year
    //   async getMonthlyOrderCounts() {
    //     const currentYear = new Date().getFullYear();
    //     const monthlyData = [];
    //     for (let month = 0; month < 12; month++) {
    //       const startDate = new Date(currentYear, month, 1);
    //       const endDate = endOfMonth(startDate);
    //       const orderCount = await Order.countDocuments({
    //         createdAt: { $gte: startDate, $lte: endDate },
    //         orderStatus: { $ne: "cancelled" },
    //       });
    //       monthlyData.push({
    //         month: format(startDate, "MMM"),
    //         orders: orderCount,
    //       });
    //     }
    //     return monthlyData;
    //   }
    // Get monthly order analytics
    getOrderAnalytics() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentYear = new Date().getFullYear();
            const monthlyData = [];
            for (let month = 0; month < 12; month++) {
                const startDate = new Date(currentYear, month, 1);
                const endDate = (0, date_fns_1.endOfMonth)(startDate);
                const orderCount = yield Order_model_1.default.countDocuments({
                    createdAt: { $gte: startDate, $lte: endDate },
                    orderStatus: { $ne: "cancelled" },
                });
                monthlyData.push({
                    month: (0, date_fns_1.format)(startDate, "MMM"),
                    orders: orderCount,
                });
            }
            return monthlyData;
        });
    }
    // Get monthly customer counts (new registrations)
    //   async getMonthlyCustomerCounts() {
    //     const currentYear = new Date().getFullYear();
    //     const monthlyData = [];
    //     for (let month = 0; month < 12; month++) {
    //       const startDate = new Date(currentYear, month, 1);
    //       const endDate = endOfMonth(startDate);
    //       const customerCount = await User.countDocuments({
    //         createdAt: { $gte: startDate, $lte: endDate },
    //       });
    //       monthlyData.push({
    //         month: format(startDate, "MMM"),
    //         customers: customerCount,
    //       });
    //     }
    //     return monthlyData;
    //   }
    // Get monthly customer analytics
    getCustomerAnalytics() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentYear = new Date().getFullYear();
            const monthlyData = [];
            for (let month = 0; month < 12; month++) {
                const startDate = new Date(currentYear, month, 1);
                const endDate = (0, date_fns_1.endOfMonth)(startDate);
                const newUserCount = yield User_model_1.default.countDocuments({
                    createdAt: { $gte: startDate, $lte: endDate },
                });
                monthlyData.push({
                    month: (0, date_fns_1.format)(startDate, "MMM"),
                    customers: newUserCount,
                });
            }
            return monthlyData;
        });
    }
    // Get top selling products distribution
    //   async getTopProductsSalesDistribution() {
    //     // Aggregate to find top products by sales quantity
    //     const topProducts = await Order.aggregate([
    //       { $unwind: "$orderedItems" },
    //       {
    //         $group: {
    //           _id: "$orderedItems.product",
    //           totalSold: { $sum: "$orderedItems.quantity" },
    //         },
    //       },
    //       { $sort: { totalSold: -1 } },
    //       { $limit: 10 },
    //       {
    //         $lookup: {
    //           from: "products",
    //           localField: "_id",
    //           foreignField: "_id",
    //           as: "productDetails",
    //         },
    //       },
    //       { $unwind: "$productDetails" },
    //       {
    //         $project: {
    //           name: "$productDetails.name",
    //           value: "$totalSold",
    //           category: "$productDetails.category",
    //         },
    //       },
    //     ]);
    //     // Further group top products by their categories
    //     const productsByCategory = await Category.populate(topProducts, {
    //       path: "category",
    //       select: "name",
    //     });
    //     // Group products by their category names
    //     const groupedProducts = productsByCategory.reduce((result, product) => {
    //       const categoryName = product.category ? product.category.name : "Other";
    //       if (!result[categoryName]) {
    //         result[categoryName] = {
    //           name: categoryName,
    //           value: 0,
    //         };
    //       }
    //       result[categoryName].value += product.value;
    //       return result;
    //     }, {});
    //     return Object.values(groupedProducts);
    //   }
    // Get top product sales distribution
    getTopProductSalesDistribution() {
        return __awaiter(this, void 0, void 0, function* () {
            // Get top products by sales quantity
            const topProducts = yield Order_model_1.default.aggregate([
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
        });
    }
    // Get full dashboard analytics data
    //   async getFullDashboardAnalytics() {
    //     const [
    //       todaySummary,
    //       revenueReport,
    //       categoryDistribution,
    //       monthlyOrderCounts,
    //       monthlyCustomerCounts,
    //       topProductsSales,
    //     ] = await Promise.all([
    //       this.getTodaySummary(),
    //       this.getRevenueReport(),
    //       this.getCategoryDistribution(),
    //       this.getMonthlyOrderCounts(),
    //       this.getMonthlyCustomerCounts(),
    //       this.getTopProductsSalesDistribution(),
    //     ]);
    //     return {
    //       todaySummary,
    //       revenueReport,
    //       categoryDistribution,
    //       monthlyOrderCounts,
    //       monthlyCustomerCounts,
    //       topProductsSales,
    //     };
    //   }
    getExtendedDashboardData() {
        return __awaiter(this, void 0, void 0, function* () {
            const [todaySummary, revenueReport, categoryDistribution, orderAnalytics, customerAnalytics, topProductSales] = yield Promise.all([
                this.getTodaySummary(),
                this.getRevenueReport(),
                this.getCategoryDistribution(),
                this.getOrderAnalytics(),
                this.getCustomerAnalytics(),
                this.getTopProductSalesDistribution()
            ]);
            return {
                todaySummary,
                revenueReport,
                categoryDistribution,
                orderAnalytics,
                customerAnalytics,
                topProductSales
            };
        });
    }
}
exports.SalesAnalyticsService = SalesAnalyticsService;
exports.default = new SalesAnalyticsService();
