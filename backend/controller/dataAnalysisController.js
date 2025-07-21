import express from 'express';
import { pool } from '../db.js';
import _ from 'lodash';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    // 1. load all tables
    const [products]       = await pool.query('SELECT productId, productName, cost, stockOnHand FROM Product');
    const [users]          = await pool.query('SELECT * FROM Users');
    const [stockEntry]     = await pool.query('SELECT entryId, productId, quantityReceived, dateReceived FROM StockEntry');
    const [stockWithdraw]  = await pool.query('SELECT entryId, quantityWithdrawn, dateWithdrawn FROM StockWithdrawal');
    const [orders]         = await pool.query('SELECT orderId, dateOrdered, paymentStatus FROM Orders');
    const [orderInfo]      = await pool.query('SELECT orderId, productId, quantity FROM OrderInfo');
    // (you can also load Returns and AuditLog if needed)

    const startDate = new Date('2024-01-01');
    const endDate   = new Date('2025-12-31');

    // 2a. paid orders
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');

    // prepare a lookup for orderInfo by orderId
    const infoByOrder = _.groupBy(orderInfo, 'orderId');

    // 2b–2c. build sales rows with cost, date, filter period, compute cogs
    let sales = [];
    for (let o of paidOrders) {
      const lines = infoByOrder[o.orderId] || [];
      for (let line of lines) {
        const prod = products.find(p => p.productId === line.productId);
        if (!prod) continue;
        const dateOrd = new Date(o.dateOrdered);
        if (dateOrd < startDate || dateOrd > endDate) continue;
        sales.push({
          productId:   line.productId,
          productName: prod.productName,
          cost:        prod.cost,
          quantity:    line.quantity,
          dateOrdered: dateOrd,
          cogs:        prod.cost * line.quantity
        });
      }
    }

    // 2d. total COGS per product
    const cogsPerProd = _(sales)
      .groupBy('productId')
      .map((items, pid) => ({
        productId:    Number(pid),
        productName:  items[0].productName,
        total_cogs:   _.sumBy(items, 'cogs')
      }))
      .value();

    // 3a. beginning on-hand = received – withdrawn **before** startDate
    // map withdrawals with productId
    const withdrawals = stockWithdraw.map(w => {
      const entry = stockEntry.find(e => e.entryId === w.entryId);
      return entry
        ? {
            productId:       entry.productId,
            quantityWithdrawn: w.quantityWithdrawn,
            dateWithdrawn:     new Date(w.dateWithdrawn)
          }
        : null;
    }).filter(Boolean);

    // sum received_before
    const receivedBefore = _(stockEntry)
      .filter(e => new Date(e.dateReceived) < startDate)
      .groupBy('productId')
      .map((items, pid) => [Number(pid), _.sumBy(items, 'quantityReceived')])
      .fromPairs()
      .value();

    // sum withdrawn_before
    const withdrawnBefore = _(withdrawals)
      .filter(w => w.dateWithdrawn < startDate)
      .groupBy('productId')
      .map((items, pid) => [Number(pid), _.sumBy(items, 'quantityWithdrawn')])
      .fromPairs()
      .value();

    // compute beg_units per product
    const begInv = Object.entries(receivedBefore).map(([pid, rec]) => ({
      productId: Number(pid),
      beg_units: rec - (withdrawnBefore[pid] || 0)
    }));

    // 3b. ending on-hand = stockOnHand from products
    const endInv = products.map(p => ({
      productId:   p.productId,
      productName: p.productName,
      stockOnHand: p.stockOnHand,
      cost:        p.cost
    }));

    // 4. merge them
    const turnover = _(cogsPerProd)
      .keyBy('productId')
      .mapValues(prod => {
        const beg = begInv.find(b => b.productId === prod.productId)?.beg_units || 0;
        const end = endInv.find(e => e.productId === prod.productId) || { stockOnHand: 0, cost: 0, productName: prod.productName };
        const avgUnits = (beg + end.stockOnHand) / 2;
        const avgInvValue = avgUnits * end.cost;
        const rate = avgInvValue > 0 ? prod.total_cogs / avgInvValue : 0;
        return {
          productId:    prod.productId,
          productName:  prod.productName,
          total_cogs:   prod.total_cogs,
          beg_units:    beg,
          end_units:    end.stockOnHand,
          cost:         end.cost,
          avg_units:    avgUnits,
          avgInvValue:  avgInvValue,
          turnoverRate: rate
        };
      })
      .values()
      .orderBy('turnoverRate', 'desc')
      .take(10)
      .value();

    res.json(turnover);

  } catch (err) {
    next(err);
  }
});

export default router;