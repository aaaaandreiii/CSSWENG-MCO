import express from 'express';
import db from "../model/db.js";
import _ from 'lodash';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    // NOTE TO FRONTEND: duration should be in days
    const topSellingDuration = Number(req.query.topSellingDuration);
    const salesReportDuration   = Number(req.query.salesReportDuration);

    // today is the end date for all queries
    const today = new Date();

    // get start date by subtracting the duration from the date today
    var topSellingStartDate = new Date();
    topSellingStartDate.setDate(today.getDate() - topSellingDuration);
    topSellingStartDate.setHours(0, 0, 0, 0);
    var salesReportStartDate = new Date();
    salesReportStartDate.setDate(today.getDate() - salesReportDuration);
    salesReportStartDate.setHours(0, 0, 0, 0);

    // 1. load all tables
    const [products]      = await db.query('SELECT productId, productName, cost, stockOnHand, safeStockCount FROM Product');
    const [orders]        = await db.query('SELECT orderId, paymentStatus, dateOrdered FROM Orders');
    const [orderInfo]     = await db.query('SELECT orderId, productId, quantity FROM OrderInfo');

    // 2a. total # of stocks
    const totalStocks = _.sumBy(products, 'stockOnHand');

    // 2b. total # of sold items
    const totalSold = _.sumBy(orderInfo, 'quantity');

    // 2c. total # of pending orders
    const totalPending = _.countBy(orders, 'paymentStatus').pending || 0;

    // 3a. out of stock products
    const outOfStockProducts = {
      amount: _(products)
          .filter(product => product.stockOnHand === 0)
          .size(),
      capital: _(products)
          .filter(product => product.stockOnHand === 0)
          .sumBy(product => product.safeStockCount * product.cost),
    };

    // 3b. low stock products
    const lowStockProducts = {
      amount: _(products)
          .filter(product => product.stockOnHand != 0 && product.stockOnHand < product.safeStockCount)
          .size(),
      capital: _(products)
          .filter(product => product.stockOnHand != 0 && product.stockOnHand < product.safeStockCount)
          .sumBy(product => (product.safeStockCount - product.stockOnHand) * product.cost),
    };

    // 4. top selling products
    const [topSellingProducts] = await db.query(
      `SELECT 
        Product.productId, Product.productName, sum(OrderInfo.quantity) AS totalQty
        FROM Product 
        JOIN OrderInfo ON Product.productId = OrderInfo.productId 
        JOIN Orders ON OrderInfo.orderId = Orders.orderId
        WHERE Orders.dateOrdered BETWEEN ? AND ?
        GROUP BY Product.productId
        ORDER BY sum(OrderInfo.quantity) DESC
        LIMIT 10`, 
      [topSellingStartDate, today]);

    // 5. avg sales per month
    const [salesPerMonth] = await db.query(
      // `SELECT sum(OrderInfo.quantity * OrderInfo.quantity) AS sum     //BRUH WHAT HAKJSDHAKJSDH why u multiplying it to itself
      //   FROM OrderInfo
      //   JOIN Orders ON OrderInfo.orderId = Orders.orderId
      //   WHERE Orders.dateOrdered BETWEEN ? AND ?
      //   GROUP BY YEAR(Orders.dateOrdered), MONTH(Orders.dateOrdered)`, 
      `SELECT 
        YEAR(Orders.dateOrdered)   AS year,
        MONTH(Orders.dateOrdered)  AS month,
        SUM(OrderInfo.quantity)    AS sum
      FROM OrderInfo
        JOIN Orders ON OrderInfo.orderId = Orders.orderId
      WHERE Orders.dateOrdered BETWEEN ? AND ?
      GROUP BY YEAR(Orders.dateOrdered), MONTH(Orders.dateOrdered)
      ORDER BY YEAR(Orders.dateOrdered), MONTH(Orders.dateOrdered)`,
      [salesReportStartDate, today]);
    
    //compute average
    const avgSalesPerMonth = _.mean(salesPerMonth.map(r => Number(r.sum)));

    //6. total sales in the last ___
    const [salesPerMonthInTheLastTimePeriod] = await db.query(
      `SELECT sum(OrderInfo.quantity * OrderInfo.quantity) AS sum
        FROM OrderInfo
        JOIN Orders ON OrderInfo.orderId = Orders.orderId
        WHERE Orders.dateOrdered BETWEEN ? AND ?`, 
      [salesReportStartDate, today]);
    const totalSalesInTheLastTimePeriod = _.sum(salesPerMonthInTheLastTimePeriod.map(sales => Number(sales.sum)));

    //  Final JSON payload
    return res.json({
      totalStocks,
      totalSold,
      totalPending,
      outOfStockProducts,
      lowStockProducts,
      topSellingProducts,
      salesPerMonth,
      avgSalesPerMonth,
      totalSalesInTheLastTimePeriod
    });

  } catch (err) {
    console.error('⚡️  GET /api/dashboardController error:', err);
    next(err);
  }
});

export default router;
