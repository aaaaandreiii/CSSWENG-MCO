import express from 'express';
import db from "../model/db.js"; // for mysql2/promise pool

const router = express.Router();
const SCHEMA  = process.env.DB_NAME;
const ALLOWED = [ // (ChatGPT suggestion: whitelist to prevent SQL‑injection)
  'Product','Users','StockEntry','StockWithdrawal',
  'Orders','OrderInfo','ReturnExchange','ReturnExchangeInfo','AuditLog'
];

router.get('/', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Missing q parameter' });
    }

    const result = {};

    for (const table of ALLOWED) {
      //get column list for this table
      const [cols] = await db.query(
        `SELECT COLUMN_NAME 
         FROM information_schema.columns
         WHERE table_schema = ? AND table_name = ?`,
        [SCHEMA, table]
      );
      if (cols.length === 0) continue;

      //build WHERE clause for substring match instead of exact match
      const clauses = cols
        .map(c => `CAST(\`${c.COLUMN_NAME}\` AS CHAR) LIKE ?`)
        .join(' OR ');
      const params  = cols.map(() => `%${q.trim()}%`);

      //run the query
      const [rows] = await db.query(
        `SELECT * FROM \`${table}\` WHERE ${clauses}`,
        params
      );
      if (rows.length) {
        result[table] = rows;
      }
    }

    console.log("Returned Results: ", result.length);
    console.log(result);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
