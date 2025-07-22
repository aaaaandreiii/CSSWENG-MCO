import express from 'express';
import db from "../model/db.js";
import _ from 'lodash';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    console.log('⚡️  GET /api/dataAnalysisController hit');

    // 1. load all tables
    const [products]      = await db.query('SELECT productId, productName, cost, stockOnHand FROM Product');
    const [stockEntry]    = await db.query('SELECT entryId, productId, quantityReceived, dateReceived FROM StockEntry');
    const [stockWithdraw] = await db.query('SELECT entryId, quantityWithdrawn, dateWithdrawn FROM StockWithdrawal');
    const [orders]        = await db.query('SELECT orderId, dateOrdered, paymentStatus FROM Orders');
    const [orderInfo]     = await db.query('SELECT orderId, productId, quantity FROM OrderInfo');
    // (you can also load Users, Returns, AuditLog if you actually need them)

    const startDate = new Date('2024-01-01');
    const endDate   = new Date('2025-12-31');

    // 2a. only paid orders
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
    const infoByOrder = _.groupBy(orderInfo, 'orderId');

    // 2b/c. build sales records and COGS
    const sales = paidOrders.flatMap(o => {
      const dateOrd = new Date(o.dateOrdered);
      if (dateOrd < startDate || dateOrd > endDate) return [];

      return (infoByOrder[o.orderId] || []).map(line => {
        const prod = products.find(p => p.productId === line.productId);
        if (!prod) return null;
        return {
          productId:   line.productId,
          productName: prod.productName,
          cost:        prod.cost,
          quantity:    line.quantity,
          dateOrdered: dateOrd,
          cogs:        prod.cost * line.quantity
        };
      }).filter(Boolean);
    });

    // 2d. total COGS per product
    const cogsPerProd = _(sales)
      .groupBy('productId')
      .map((items, pid) => ({
        productId:   Number(pid),
        productName: items[0].productName,
        total_cogs:  _.sumBy(items, 'cogs')
      }))
      .value();

    // 3. beginning inventory before startDate
    const withdrawals = stockWithdraw
      .map(w => {
        const entry = stockEntry.find(e => e.entryId === w.entryId);
        return entry && new Date(w.dateWithdrawn) < startDate
          ? { productId: entry.productId, qty: w.quantityWithdrawn }
          : null;
      })
      .filter(Boolean);

    const receivedBefore = _(stockEntry)
      .filter(e => new Date(e.dateReceived) < startDate)
      .groupBy('productId')
      .map((items, pid) => [Number(pid), _.sumBy(items, 'quantityReceived')])
      .fromPairs()
      .value();

    const withdrawnBefore = _(withdrawals)
      .groupBy('productId')
      .map((items, pid) => [Number(pid), _.sumBy(items, 'qty')])
      .fromPairs()
      .value();

    const begInv = Object.entries(receivedBefore).map(([pid, rec]) => ({
      productId: Number(pid),
      beg_units: rec - (withdrawnBefore[pid] || 0)
    }));

    // 3b. ending inventory
    const endInv = products.map(p => ({
      productId:   p.productId,
      productName: p.productName,
      stockOnHand: p.stockOnHand,
      cost:        p.cost
    }));

    // 4. calculate turnover
    const turnoverAll = _(cogsPerProd)
      .keyBy('productId')
      .mapValues(prod => {
        const beg     = begInv.find(b => b.productId === prod.productId)?.beg_units || 0;
        const end     = endInv.find(e => e.productId === prod.productId) || { stockOnHand:0, cost:0 };
        const avgU    = (beg + end.stockOnHand) / 2;
        const avgVal  = avgU * end.cost;
        const rate    = avgVal > 0 ? prod.total_cogs / avgVal : 0;
        return {
          productId:    prod.productId,
          productName:  prod.productName,
          total_cogs:   prod.total_cogs,
          turnoverRate: rate
        };
      })
      .values()
      .value();

    // pick top 10 by turnoverRate
    const top10 = _(turnoverAll)
      .orderBy('turnoverRate', 'desc')
      .take(10)
      .value();

    // **ONE** JSON response, then return:
    return res.json({
      allProducts: turnoverAll,
      top10
    });

  } catch (err) {
    console.error('⚡️  GET /api/dataAnalysisController error:', err);
    next(err);
  }
});

export default router;
