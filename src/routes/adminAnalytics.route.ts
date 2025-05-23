
import { Router } from "express";
import SalesAnalyticsController from "../controllers/adminAnalytics.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = Router();


router.use(protect);
router.use(authorize("admin", "super_admin"));


router.get("/today-summary", SalesAnalyticsController.getTodaySummary);
router.get("/revenue-report", SalesAnalyticsController.getRevenueReport);


router.get(
  "/category-distribution",
  SalesAnalyticsController.getCategoryDistribution
);
router.get("/order-analytics", SalesAnalyticsController.getOrderAnalytics);
router.get(
  "/customer-analytics",
  SalesAnalyticsController.getCustomerAnalytics
);
router.get("/top-product-sales", SalesAnalyticsController.getTopProductSales);

// Dashboard data routes
router.get("/dashboard", SalesAnalyticsController.getDashboardData);
router.get(
  "/extended-dashboard",
  SalesAnalyticsController.getExtendedDashboardData
);

export default router;
