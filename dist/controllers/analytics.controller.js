"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSummaryAnalytics = void 0;
const analyticsServices_1 = require("../service/analyticsServices");
const getSummaryAnalytics = async (req, res) => {
    try {
        const data = await (0, analyticsServices_1.getAnalyticsSummary)();
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        console.error("Analytics error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.getSummaryAnalytics = getSummaryAnalytics;
//# sourceMappingURL=analytics.controller.js.map