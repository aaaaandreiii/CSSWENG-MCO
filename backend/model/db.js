import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({                           //edit your .env file to set these variables
    host: process.env.DB_HOST || 'localhost',               // hostname of the database server
    user: process.env.DB_USER,                              //'root' or your username
    password: process.env.DB_PASSWORD,                      // '!1230#AzK' or your password
    database: process.env.DB_NAME,                          // 'mydb' or 'dbdbdb'
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0
});

console.log('MySQL pool created (promise API)');

export default db;


// in model/db.js (or wherever you import `db`)
export async function processCascade(map, id) {
  for (const [table, config] of Object.entries(map)) {
    const values = typeof config.values === 'function'
      ? config.values(id)
      : [id];
    const sql = `UPDATE ${table} SET deleteFlag = 1 WHERE ${config.where}`;

    // promise style—no callbacks
    const [result] = await db.query(sql, values);
    console.log(`Soft-deleted from ${table}: ${result.affectedRows} rows`);

    if (config.cascade) {
      await processCascade(config.cascade, id);
    }
  }
}