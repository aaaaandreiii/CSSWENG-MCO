import express from 'express';
import db from '../model/db.js';

const router = express.Router();
const SCHEMA = process.env.DB_NAME;
const ALLOWED = [ // ChatGPT suggestion: whitelist to prevent SQL‑injection
  'Product','Users','StockEntry','StockWithdrawal',
  'Orders','OrderInfo','ReturnExchange','ReturnExchangeInfo','AuditLog'
];
const EXCLUDE = { //remove sensitive information in overall query
  Users: ['userPassword'],
};

router.get('/', async (req, res, next) => {
  try {
    const { table, q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Missing q parameter' });
    }

    const doSearch = async tbl => {
      //lance implementation: Table‑specific search 
      //fetch searchable columns / get column list for this table
      const [cols] = await db.query(
        `SELECT COLUMN_NAME
           FROM information_schema.columns
          WHERE table_schema = ? AND table_name = ?`,
        [SCHEMA, tbl]
      );

      //filter out excluded columns
      const excludeCols = EXCLUDE[tbl] || [];
      const safeCols = cols
        .map(c => c.COLUMN_NAME)
        .filter(cn => !excludeCols.includes(cn));

      if (safeCols.length === 0) {
        return []; //no columns returned --> no queried results
      }

      //build WHERE clause for substring match instead of exact match
      const where = safeCols
        .map(cn => `CAST(\`${cn}\` AS CHAR) LIKE ?`)
        .join(' OR ');
      const params = safeCols.map(() => `%${q.trim()}%`);

      //build a SELECT list
      const selectList = safeCols.map(cn => `\`${cn}\``).join(', ');

      const [rows] = await db.query(
        `SELECT ${selectList} FROM \`${tbl}\` WHERE ${where}`,
        params
      );
      return rows;
    };

    // === Table‑specific search ===
    if (table) {
      if (!ALLOWED.includes(table)) {
        return res.status(400).json({ error: 'Invalid table name' });
      }
      const rows = await doSearch(table);
      return res.json(rows);
    }

    //andrei implementation: Aggregated search across all tables
    const result = {};
    for (const tbl of ALLOWED) {
      const rows = await doSearch(tbl);
      if (rows.length) {
        result[tbl] = rows;
      }
    }
    return res.json(result);
  }
  catch (err) {
    next(err);
  }
});

export default router;
