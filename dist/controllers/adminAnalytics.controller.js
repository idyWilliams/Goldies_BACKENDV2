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
exports.SalesAnalyticsController = void 0;
const admin_analytics_1 = __importDefault(require("../service/admin.analytics"));
class SalesAnalyticsController {
    /**
     * Get today's sales summary
     */
    getTodaySummary(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const summary = yield admin_analytics_1.default.getTodaySummary();
                return res.status(200).json(summary);
            }
            catch (error) {
                console.error("Error getting sales summary:", error);
                return res.status(500).json({ message: "Failed to get sales summary" });
            }
        });
    }
    /**
     * Get revenue report data for chart
     */
    getRevenueReport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const revenueData = yield admin_analytics_1.default.getRevenueReport();
                return res.status(200).json(revenueData);
            }
            catch (error) {
                console.error("Error getting revenue report:", error);
                return res.status(500).json({ message: "Failed to get revenue report" });
            }
        });
    }
    /**
     * Get best-selling products
     */
    getBestSellingProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const limit = req.query.limit ? parseInt(req.query.limit) : 5;
                const products = yield admin_analytics_1.default.getBestSellingProducts(limit);
                return res.status(200).json(products);
            }
            catch (error) {
                console.error("Error getting best-selling products:", error);
                return res
                    .status(500)
                    .json({ message: "Failed to get best-selling products" });
            }
        });
    }
    /**
     * Get full sales dashboard data
     */
    getDashboardData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [summary, revenueReport, bestSellingProducts] = yield Promise.all([
                    admin_analytics_1.default.getTodaySummary(),
                    admin_analytics_1.default.getRevenueReport(),
                    admin_analytics_1.default.getBestSellingProducts(5),
                ]);
                return res.status(200).json({
                    summary,
                    revenueReport,
                    bestSellingProducts,
                });
            }
            catch (error) {
                console.error("Error getting dashboard data:", error);
                return res.status(500).json({ message: "Failed to get dashboard data" });
            }
        });
    }
    //   async getCategoryDistribution(req: Request, res: Response) {
    //     try {
    //       const categoryData =
    //         await SalesAnalyticsService.getCategoryDistribution();
    //       return res.status(200).json(categoryData);
    //     } catch (error) {
    //       console.error("Error getting category distribution:", error);
    //       return res
    //         .status(500)
    //         .json({ message: "Failed to get category distribution" });
    //     }
    //   }
    /**
     * Get category distribution for pie chart
     */
    getCategoryDistribution(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categories = yield admin_analytics_1.default.getCategoryDistribution();
                return res.status(200).json(categories);
            }
            catch (error) {
                console.error("Error getting category distribution:", error);
                return res
                    .status(500)
                    .json({ message: "Failed to get category distribution" });
            }
        });
    }
    /**
     * Get monthly order counts
     */
    //   async getMonthlyOrderCounts(req: Request, res: Response) {
    //     try {
    //       const orderData = await SalesAnalyticsService.getMonthlyOrderCounts();
    //       return res.status(200).json(orderData);
    //     } catch (error) {
    //       console.error("Error getting monthly order counts:", error);
    //       return res
    //         .status(500)
    //         .json({ message: "Failed to get monthly order counts" });
    //     }
    //   }
    /**
     * Get order analytics by month
     */
    getOrderAnalytics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orderData = yield admin_analytics_1.default.getOrderAnalytics();
                return res.status(200).json(orderData);
            }
            catch (error) {
                console.error("Error getting order analytics:", error);
                return res.status(500).json({ message: "Failed to get order analytics" });
            }
        });
    }
    /**
     * Get monthly customer counts
     */
    //   async getMonthlyCustomerCounts(req: Request, res: Response) {
    //     try {
    //       const customerData =
    //         await SalesAnalyticsService.getMonthlyCustomerCounts();
    //       return res.status(200).json(customerData);
    //     } catch (error) {
    //       console.error("Error getting monthly customer counts:", error);
    //       return res
    //         .status(500)
    //         .json({ message: "Failed to get monthly customer counts" });
    //     }
    //   }
    /**
     * Get customer analytics by month
     */
    getCustomerAnalytics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const customerData = yield admin_analytics_1.default.getCustomerAnalytics();
                return res.status(200).json(customerData);
            }
            catch (error) {
                console.error("Error getting customer analytics:", error);
                return res
                    .status(500)
                    .json({ message: "Failed to get customer analytics" });
            }
        });
    }
    /**
     * Get top product sales distribution
     */
    //   async getTopProductsSalesDistribution(req: Request, res: Response) {
    //     try {
    //       const productData =
    //         await SalesAnalyticsService.getTopProductsSalesDistribution();
    //       return res.status(200).json(productData);
    //     } catch (error) {
    //       console.error("Error getting top product sales distribution:", error);
    //       return res
    //         .status(500)
    //         .json({ message: "Failed to get top product sales distribution" });
    //     }
    //   }
    /**
     * Get top product sales distribution
     */
    getTopProductSales(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const topProducts = yield admin_analytics_1.default.getTopProductSalesDistribution();
                return res.status(200).json(topProducts);
            }
            catch (error) {
                console.error("Error getting top product sales:", error);
                return res
                    .status(500)
                    .json({ message: "Failed to get top product sales" });
            }
        });
    }
    /**
     * Get full dashboard analytics
     */
    //   async getFullDashboardAnalytics(req: Request, res: Response) {
    //     try {
    //       const dashboardData =
    //         await SalesAnalyticsService.getFullDashboardAnalytics();
    //       return res.status(200).json(dashboardData);
    //     } catch (error) {
    //       console.error("Error getting full dashboard analytics:", error);
    //       return res
    //         .status(500)
    //         .json({ message: "Failed to get full dashboard analytics" });
    //     }
    //   }
    /**
     * Get all extended dashboard data in a single request
     */
    getExtendedDashboardData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dashboardData = yield admin_analytics_1.default.getExtendedDashboardData();
                return res.status(200).json(dashboardData);
            }
            catch (error) {
                console.error("Error getting extended dashboard data:", error);
                return res.status(500).json({ message: "Failed to get dashboard data" });
            }
        });
    }
}
exports.SalesAnalyticsController = SalesAnalyticsController;
exports.default = new SalesAnalyticsController();
