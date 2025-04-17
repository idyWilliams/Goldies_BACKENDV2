// src/controllers/SalesAnalyticsController.ts
import { Request, Response } from "express";
import SalesAnalyticsService from "../service/admin.analytics";

export class SalesAnalyticsController {
  /**
   * Get today's sales summary
   */
  async getTodaySummary(req: Request, res: Response) {
    try {
      const summary = await SalesAnalyticsService.getTodaySummary();
      return res.status(200).json(summary);
    } catch (error) {
      console.error("Error getting sales summary:", error);
      return res.status(500).json({ message: "Failed to get sales summary" });
    }
  }

  /**
   * Get revenue report data for chart
   */
  async getRevenueReport(req: Request, res: Response) {
    try {
      const revenueData = await SalesAnalyticsService.getRevenueReport();
      return res.status(200).json(revenueData);
    } catch (error) {
      console.error("Error getting revenue report:", error);
      return res.status(500).json({ message: "Failed to get revenue report" });
    }
  }

  /**
   * Get best-selling products
   */
  async getBestSellingProducts(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const products = await SalesAnalyticsService.getBestSellingProducts(
        limit
      );
      return res.status(200).json(products);
    } catch (error) {
      console.error("Error getting best-selling products:", error);
      return res
        .status(500)
        .json({ message: "Failed to get best-selling products" });
    }
  }

  /**
   * Get full sales dashboard data
   */
  async getDashboardData(req: Request, res: Response) {
    try {
      const [summary, revenueReport, bestSellingProducts] = await Promise.all([
        SalesAnalyticsService.getTodaySummary(),
        SalesAnalyticsService.getRevenueReport(),
        SalesAnalyticsService.getBestSellingProducts(5),
      ]);

      return res.status(200).json({
        summary,
        revenueReport,
        bestSellingProducts,
      });
    } catch (error) {
      console.error("Error getting dashboard data:", error);
      return res.status(500).json({ message: "Failed to get dashboard data" });
    }
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
  async getCategoryDistribution(req: Request, res: Response) {
    try {
      const categories = await SalesAnalyticsService.getCategoryDistribution();
      return res.status(200).json(categories);
    } catch (error) {
      console.error("Error getting category distribution:", error);
      return res
        .status(500)
        .json({ message: "Failed to get category distribution" });
    }
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
  async getOrderAnalytics(req: Request, res: Response) {
    try {
      const orderData = await SalesAnalyticsService.getOrderAnalytics();
      return res.status(200).json(orderData);
    } catch (error) {
      console.error("Error getting order analytics:", error);
      return res.status(500).json({ message: "Failed to get order analytics" });
    }
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
  async getCustomerAnalytics(req: Request, res: Response) {
    try {
      const customerData = await SalesAnalyticsService.getCustomerAnalytics();
      return res.status(200).json(customerData);
    } catch (error) {
      console.error("Error getting customer analytics:", error);
      return res
        .status(500)
        .json({ message: "Failed to get customer analytics" });
    }
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
  async getTopProductSales(req: Request, res: Response) {
    try {
      const topProducts =
        await SalesAnalyticsService.getTopProductSalesDistribution();
      return res.status(200).json(topProducts);
    } catch (error) {
      console.error("Error getting top product sales:", error);
      return res
        .status(500)
        .json({ message: "Failed to get top product sales" });
    }
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
  async getExtendedDashboardData(req: Request, res: Response) {
    try {
      const dashboardData =
        await SalesAnalyticsService.getExtendedDashboardData();
      return res.status(200).json(dashboardData);
    } catch (error) {
      console.error("Error getting extended dashboard data:", error);
      return res.status(500).json({ message: "Failed to get dashboard data" });
    }
  }
}

export default new SalesAnalyticsController();
