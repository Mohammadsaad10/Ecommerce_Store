import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { getAnalyticsData, getDailySalesData } from "../controllers/analytics.controller.js";

const router = express.Router();


//This route is used to fetch analytics data for the admin panel. 
//It is a protected route, which means only authenticated admin users can access this route.

router.get("/", protectRoute, adminRoute, async (req, res) => {
    try {
        //Fetching analytics data from the backend functions
        const analyticsData = await getAnalyticsData(); //number of users, products, total sales, total revenue

        //Fetching daily sales data for the past 7 days
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        const dailySalesData = await getDailySalesData(startDate, endDate); //data includes sales count and revenue for each day

        //Response to the frontend with both analytics data and daily sales data
        res.json({ analyticsData, dailySalesData });

    } catch (error) {
        console.log("Error in analytics route", error.message);
        //If an error occurs, sending an error response to the frontend
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

export default router;