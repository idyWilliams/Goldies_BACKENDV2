import { Router } from "express";
import { getSummaryAnalytics } from "../controllers/analytics.controller";

const router = Router();

router.get("/summary", getSummaryAnalytics);

export default router;
