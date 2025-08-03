import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const sslOptions = process.env.CA
  ? { ca: fs.readFileSync(process.env.CA) }
  : undefined;

const db = mysql.createPool({                           //edit your .env file to set these variables
    host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',               // hostname of the database server
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || process.env.DB_USER,                              //'root' or your username
    password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD,                      // '!1230#AzK' or your password
    database: process.env.MYSQL_DATABASE || process.env.DB_NAME,                          // 'mydb' or 'dbdbdb'
    timezone: 'Z',
    supportBigNumbers: true,
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,

    //only include ssl when we have the CA for TiDB-Cloud:
    ...(sslOptions ? { ssl: sslOptions } : {})
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