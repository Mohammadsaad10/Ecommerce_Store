import User from "../models/user.model.js";
import Product from "../models/products.model.js";
import Order from "../models/order.model.js";

/**
 * This function retrieves analytics data for the admin panel.
 * It counts the total number of users and products in the database.
 * It then aggregates the Order collection to calculate the total number of sales and total revenue.
 * Finally, it returns an object containing the total number of users, products, total sales, and total revenue.
 *
 * @return {Promise<{users: number, products: number, totalSales: number, totalRevenue: number}>} An object containing the total number of users, products, total sales, and total revenue.
 **/

export const getAnalyticsData = async () => {
  // Count the total number of users in the User collection
  const totalUsers = await User.countDocuments();

  // Count the total number of products in the Product collection
  const totalProducts = await Product.countDocuments();

  // Aggregate the Order collection to calculate the total number of sales and total revenue
  const salesData = await Order.aggregate([
    {
      $group: {
        _id: null, // it groups all documents together as one.
        totalSales: { $sum: 1 }, // sum/ count all documents(orders).
        totalRevenue: { $sum: "$totalAmount" }, // sum of totalAmount field in all documents(orders).
      },
    },
  ]);

  // Extract the total number of sales and total revenue from the aggregation result
  const { totalSales, totalRevenue } = salesData[0] || {
    totalSales: 0,
    totalRevenue: 0,
  }; //as _id: null , only one document will be returned. Thus, this line says if salesData[0] exists, take it or if it doesn't exist, take {totalSales: 0, totalRevenue: 0}

  // Return an object containing the total number of users, products, total sales, and total revenue
  return {
    users: totalUsers,
    products: totalProducts,
    totalSales,
    totalRevenue,
  };
};

/**
 * This function retrieves daily sales data for a given date range.
 * It uses MongoDB's aggregation framework to group the orders by date and calculate the total sales and revenue for each date.
 * It then generates a list of dates in the given range and maps over it to find the corresponding sales data for each date.
 * If there is no sales data for a particular date, it returns an object with sales and revenue set to 0.
 *
 * @param {Date} startDate - The start date of the date range.
 * @param {Date} endDate - The end date of the date range.
 * @return {Promise<Array<{date: string, sales: number, revenue: number}>>} An array of objects containing the date, sales, and revenue for each day in the date range.
 */
export const getDailySalesData = async (startDate, endDate) => {
  try {
    // Aggregate the Order collection to group the orders by date and calculate the total sales and revenue for each date
    const dailySalesData = await Order.aggregate([
      {
        $match: {
          //$match => filters the documents in the collection based on the specified condition.
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      {
        $group: {
          //$group => groups the documents in the collection based on the specified condition.
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, //groups all documents (orders) by date.
          sales: { $sum: 1 }, //sums/counts all documents (orders) for each date.
          revenue: { $sum: "$totalAmount" }, // sum of totalAmount field in all documents (orders) for each date.
        },
      },

      {
        $sort: {
          _id: 1, //sorts the documents in the collection in ascending order based on the _id field.
        },
      },
    ]);

    // Generate a list of dates in the given range
    const dateArray = getDatesInRange(startDate, endDate);

    // Map over the date array to find the corresponding sales data for each date
    return dateArray.map((date) => {
      const foundData = dailySalesData.find((item) => item._id === date); // find -> returns the first document (order) that matches the specified condition.

      // If there is no sales data for a particular date, return an object with sales and revenue set to 0
      return {
        date,
        sales: foundData?.sales || 0,
        revenue: foundData?.revenue || 0,
      };
    });
  } catch (error) {
    throw error;
  }
};

/**
 * This function generates a list of dates in a given date range.
 * It initializes a currentDate variable to the startDate and iterates until it is greater than or equal to the endDate.
 * In each iteration, it adds one day to the currentDate and pushes the formatted date string to the dates array.
 * Finally, it returns the dates array.
 *
 * @param {Date} startDate - The start date of the date range.
 * @param {Date} endDate - The end date of the date range.
 * @return {Array<string>} An array of date strings representing each day in the date range.
 */
function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]); // Format the date as "YYYY-MM-DD"
    currentDate.setDate(currentDate.getDate() + 1); // Add one day to the currentDate
  }

  return dates;
}
