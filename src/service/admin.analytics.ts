// src/services/SalesAnalyticsService.ts
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  format,
} from "date-fns";
import User from "../models/User.model";
import Order from "../models/Order.model";
import Category from "../models/Category.model";
import Product from "../models/Product.model";

export class SalesAnalyticsService {
  // Get today's summary data
  async getTodaySummary() {
    const today = new Date();
    const yesterday = subDays(today, 1);

    // Today's data
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const todayOrders = await this.getOrdersInPeriod(todayStart, todayEnd);

    // Yesterday's data for comparison
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);
    const yesterdayOrders = await this.getOrdersInPeriod(
      yesterdayStart,
      yesterdayEnd
    );

    // Calculate metrics
    const todayTotalSales = this.calculateTotalSales(todayOrders);
    const todayTotalOrders = todayOrders.length;
    const todayNewCustomers = await this.countNewCustomers(
      todayStart,
      todayEnd
    );

    // Calculate metrics for yesterday
    const yesterdayTotalSales = this.calculateTotalSales(yesterdayOrders);
    const yesterdayTotalOrders = yesterdayOrders.length;
    const yesterdayNewCustomers = await this.countNewCustomers(
      yesterdayStart,
      yesterdayEnd
    );

    // Calculate percentage changes
    const salesPercentChange = this.calculatePercentChange(
      todayTotalSales,
      yesterdayTotalSales
    );
    const ordersPercentChange = this.calculatePercentChange(
      todayTotalOrders,
      yesterdayTotalOrders
    );
    const customersPercentChange = this.calculatePercentChange(
      todayNewCustomers,
      yesterdayNewCustomers
    );

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

    async getExtendedDashboardData() {
    const [
      todaySummary,
      revenueReport,
      categoryDistribution,
      orderAnalytics,
      customerAnalytics,
      topProductSales
    ] = await Promise.all([
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
  }
}

export default new SalesAnalyticsService();
