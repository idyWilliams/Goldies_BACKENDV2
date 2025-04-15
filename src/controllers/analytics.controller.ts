
import { Request, Response } from "express";
import { getAnalyticsSummary } from "../service/analyticsServices";



export interface AnalyticsSummary {
  cakesDelivered: number;
  verifiedCustomers: number;
  recipesCount: number;
}
export const getSummaryAnalytics = async (req: Request, res: Response) => {
  try {
    const data: AnalyticsSummary = await getAnalyticsSummary();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
