import express from 'express';
import db from "../model/db.js"
import _ from 'lodash';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    console.log('⚡️  GET /api/dataAnalysisController hit');

    // 1. load all tables
    const [products]       = await db.query('SELECT productId, productName, cost, stockOnHand FROM Product');
    const [users]          = await db.query('SELECT * FROM Users');
    const [stockEntry]     = await db.query('SELECT entryId, productId, quantityReceived, dateReceived FROM StockEntry');
    const [stockWithdraw]  = await db.query('SELECT entryId, quantityWithdrawn, dateWithdrawn FROM StockWithdrawal');
    const [orders]         = await db.query('SELECT orderId, dateOrdered, paymentStatus FROM Orders');
    const [orderInfo]      = await db.query('SELECT orderId, productId, quantity FROM OrderInfo');
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

    // res.json(turnover);

    // debugging purposes: Total COGS per product
    console.log('\n📦 Total COGS per product:');
    console.table(
      cogsPerProd.map(p => ({
        'Product ID':    p.productId,
        'Product Name':  p.productName,
        'Total COGS':    p.total_cogs.toFixed(2)
      }))
    );

    // debugging purposes: Turnover rate per product (for all products with COGS)
    const turnoverAll = _(cogsPerProd)
      .keyBy('productId')
      .mapValues(prod => {
        const beg   = begInv.find(b => b.productId === prod.productId)?.beg_units || 0;
        const end   = endInv.find(e => e.productId === prod.productId) || { stockOnHand:0, cost:0 };
        const avgU  = (beg + end.stockOnHand) / 2;
        const avgV  = avgU * end.cost;
        const rate  = avgV > 0 ? prod.total_cogs / avgV : 0;
        return {
          productId:    prod.productId,
          productName:  prod.productName,
          turnoverRate: rate
        };
      })
      .values()
      .value();

    console.log('\n🔄 Turnover rate per product:');
    console.table(
      turnoverAll.map(t => ({
        'Product ID':    t.productId,
        'Product Name':  t.productName,
        'Turnover Rate': t.turnoverRate.toFixed(2)
      }))
    );

    // debugging purposes: Top 10 by turnover rate
    const top10 = _(turnoverAll)
      .orderBy('turnoverRate', 'desc')
      .take(10)
      .value();

    console.log('\n🏆 Top 10 Products by Inventory Turnover Rate:');
    console.table(
      top10.map((t, i) => ({
        Rank:           i + 1,
        'Product ID':   t.productId,
        'Product Name': t.productName,
        'Turnover Rate': t.turnoverRate.toFixed(2)
      }))
    );

    console.log('Total COGS per product:', cogsPerProd);
    console.log('Turnover rate per product:', turnoverAll);
    console.log('Top 10 Products by Turnover Rate:', top10);


    res.json(top10);

  } catch (err) {
    console.log('⚡️  GET /api/dataAnalysisController NOT hit');
    next(err);
  }
});

export default router;