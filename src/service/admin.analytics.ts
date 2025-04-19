// src/services/SalesAnalyticsService.ts
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  format,
  subMonths,
  startOfYear,
  endOfYear,
} from "date-fns";
import User from "../models/User.model";
import Order from "../models/Order.model";
import Category from "../models/Category.model";
import Product from "../models/Product.model";

export class SalesAnalyticsService {
  // Get total summary data with period comparison
  async getTotalSummary(period = "month") {
    const today = new Date();
    let currentPeriodStart: Date;
    let currentPeriodEnd: Date;
    let previousPeriodStart: Date;
    let previousPeriodEnd: Date;

    switch (period) {
      case "all":
        try {
          const firstOrder = await Order.findOne().sort({ createdAt: 1 });

          // Check if firstOrder exists and has createdAt property
          currentPeriodStart =
            firstOrder && firstOrder.createdAt
              ? new Date(firstOrder.createdAt)
              : new Date(2020, 0, 1); // default to Jan 1, 2020 if no orders

          currentPeriodEnd = endOfDay(today);

          // For comparison, use the same time span but previous period
          const timeDiff = today.getTime() - currentPeriodStart.getTime();
          previousPeriodStart = new Date(
            currentPeriodStart.getTime() - timeDiff
          );
          previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1); // day before current period starts
        } catch (error) {
          console.error("Error determining all-time period:", error);
          // Fallback values if there's an error
          currentPeriodStart = new Date(2020, 0, 1);
          currentPeriodEnd = endOfDay(today);
          previousPeriodStart = new Date(2015, 0, 1);
          previousPeriodEnd = new Date(2019, 11, 31);
        }
        break;
      case "week":
        currentPeriodStart = startOfDay(subDays(today, 6));
        currentPeriodEnd = endOfDay(today);
        previousPeriodStart = startOfDay(subDays(today, 13));
        previousPeriodEnd = endOfDay(subDays(today, 7));
        break;
      case "month":
        currentPeriodStart = startOfMonth(today);
        currentPeriodEnd = endOfDay(today);
        previousPeriodStart = startOfMonth(subMonths(today, 1));
        previousPeriodEnd = endOfMonth(subMonths(today, 1));
        break;
      case "year":
        currentPeriodStart = startOfYear(today);
        currentPeriodEnd = endOfDay(today);
        previousPeriodStart = startOfYear(subMonths(today, 12));
        previousPeriodEnd = endOfYear(subMonths(today, 12));
        break;
      default: // Default to 'all' if invalid period
        try {
          const defaultFirstOrder = await Order.findOne().sort({
            createdAt: 1,
          });
          currentPeriodStart =
            defaultFirstOrder && defaultFirstOrder.createdAt
              ? new Date(defaultFirstOrder.createdAt)
              : new Date(2020, 0, 1);
          currentPeriodEnd = endOfDay(today);
          const defaultTimeDiff =
            today.getTime() - currentPeriodStart.getTime();
          previousPeriodStart = new Date(
            currentPeriodStart.getTime() - defaultTimeDiff
          );
          previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1);
        } catch (error) {
          console.error("Error in default case:", error);
          // Fallback values
          currentPeriodStart = new Date(2020, 0, 1);
          currentPeriodEnd = endOfDay(today);
          previousPeriodStart = new Date(2015, 0, 1);
          previousPeriodEnd = new Date(2019, 11, 31);
        }
    }

    // Current period data
    const currentPeriodOrders = await this.getOrdersInPeriod(
      currentPeriodStart,
      currentPeriodEnd
    );

    // Previous period data for comparison
    const previousPeriodOrders = await this.getOrdersInPeriod(
      previousPeriodStart,
      previousPeriodEnd
    );

    // Calculate metrics for current period
    const currentTotalSales = this.calculateTotalSales(currentPeriodOrders);
    const currentTotalOrders = currentPeriodOrders.length;
    const currentNewCustomers = await this.countNewCustomers(
      currentPeriodStart,
      currentPeriodEnd
    );

    // Calculate average order value for current period
    const currentAverageOrderValue =
      currentTotalOrders > 0 ? currentTotalSales / currentTotalOrders : 0;

    // Calculate metrics for previous period
    const previousTotalSales = this.calculateTotalSales(previousPeriodOrders);
    const previousTotalOrders = previousPeriodOrders.length;
    const previousNewCustomers = await this.countNewCustomers(
      previousPeriodStart,
      previousPeriodEnd
    );

    // Calculate average order value for previous period
    const previousAverageOrderValue =
      previousTotalOrders > 0 ? previousTotalSales / previousTotalOrders : 0;

    // Calculate percentage changes
    const salesPercentChange = this.calculatePercentChange(
      currentTotalSales,
      previousTotalSales
    );
    const ordersPercentChange = this.calculatePercentChange(
      currentTotalOrders,
      previousTotalOrders
    );
    const customersPercentChange = this.calculatePercentChange(
      currentNewCustomers,
      previousNewCustomers
    );
    const aovPercentChange = this.calculatePercentChange(
      currentAverageOrderValue,
      previousAverageOrderValue
    );

    return {
      period: {
        type: period,
        current: {
          start: format(currentPeriodStart, "yyyy-MM-dd"),
          end: format(currentPeriodEnd, "yyyy-MM-dd"),
        },
        previous: {
          start: format(previousPeriodStart, "yyyy-MM-dd"),
          end: format(previousPeriodEnd, "yyyy-MM-dd"),
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
      const endDate = endOfMonth(startDate);

      const orders = await this.getOrdersInPeriod(startDate, endDate);
      const totalRevenue = this.calculateTotalSales(orders);

      monthlyData.push({
        month: format(startDate, "MMM"),
        revenue: totalRevenue,
      });
    }

    return monthlyData;
  }

  // Helper methods
  private async getOrdersInPeriod(startDate: Date, endDate: Date) {
    return Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      orderStatus: { $ne: "cancelled" }, // Exclude cancelled orders
    });
  }

  private calculateTotalSales(orders: any[]) {
    return orders.reduce((total, order) => total + order.fee.total, 0);
  }

  private async countNewCustomers(startDate: Date, endDate: Date) {
    // Count users created during this period
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    return newUsers;
  }

  private calculatePercentChange(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : 0;
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
    const topProducts = await Order.aggregate([
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
    const cakeCategories = await Category.find({ status: true });
    const categoryData = [];

    for (const category of cakeCategories) {
      // Count products in this category
      const productCount = await Product.countDocuments({
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
      const endDate = endOfMonth(startDate);

      const orderCount = await Order.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        orderStatus: { $ne: "cancelled" },
      });

      monthlyData.push({
        month: format(startDate, "MMM"),
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
      const endDate = endOfMonth(startDate);

      const newUserCount = await User.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
      });

      monthlyData.push({
        month: format(startDate, "MMM"),
        customers: newUserCount,
      });
    }

    return monthlyData;
  }

  // Get top product sales distribution
  async getTopProductSalesDistribution() {
    // Get top products by sales quantity
    const topProducts = await Order.aggregate([
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
        categoryMap.set(
          categoryName,
          categoryMap.get(categoryName) + product.totalQuantity
        );
      } else {
        categoryMap.set(categoryName, product.totalQuantity);
      }
    });

    const topProductData = Array.from(categoryMap.entries()).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    return topProductData;
  }



  async getExtendedDashboardData(period = "all") {
    const [
      totalSummary,
      revenueReport,
      categoryDistribution,
      orderAnalytics,
      customerAnalytics,
      topProductSales,
    ] = await Promise.all([
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

export default new SalesAnalyticsService();
