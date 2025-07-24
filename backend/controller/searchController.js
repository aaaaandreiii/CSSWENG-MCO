const express = require('express');
const router  = express.Router();
const db      = require('../db');        // your mysql2/promise pool
const SCHEMA  = process.env.DB_NAME;     // e.g. “mydb”
const ALLOWED = [                        // whitelist to prevent SQL‑injection
  'Product','Users','StockEntry','StockWithdrawal',
  'Orders','OrderInfo','ReturnExchange','ReturnExchangeInfo','AuditLog'
];

router.get('/', async (req, res, next) => {
  try {
    const { table, q } = req.query;
    if (!table || !q) {
      return res.status(400).json({ error: 'Missing table or q parameter' });
    }
    if (!ALLOWED.includes(table)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    // 2. Fetch the searchable columns for this table
    const [cols] = await db.query(
      `SELECT COLUMN_NAME, DATA_TYPE
       FROM information_schema.columns
       WHERE table_schema = ? AND table_name = ?`,
      [SCHEMA, table]
    );

    // 3. Build a WHERE clause that does CAST(col AS CHAR) LIKE '%q%'
    //    We include most types so numbers/dates get string‑matched too.
    const patterns = cols
      .map(c => `CAST(\`${c.COLUMN_NAME}\` AS CHAR) LIKE ?`)
      .filter((clause, i) => !!cols[i])   // keep all columns
      .join(' OR ');

    const params = cols.map(() => `%${q}%`);

    // 4. Run the query
    const [rows] = await db.query(
      `SELECT * FROM \`${table}\`
       WHERE ${patterns}`,
      params
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
