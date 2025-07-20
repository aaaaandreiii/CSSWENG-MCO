import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const db = mysql.createConnection({                        //edit your .env file to set these variables
    host: process.env.DB_HOST || 'localhost',               // hostname of the database server
    user: process.env.DB_USER,                              //'root' or your username
    password: process.env.DB_PASSWORD,                      // '!1230#AzK' or your password
    database: process.env.DB_NAME                           // 'mydb' or 'dbdbdb'
});

db.connect(err =>{
    if(err) throw err;
    console.log("connected!");
});

export async function processCascade(map, id){
    for(const [table, config] of Object.entries(map)){
        const values = typeof config.values === 'function' ? config.values(id) : [id];
        const sql = `
            UPDATE ${table}
            SET deleteFlag = 1
            WHERE ${config.where}
        `;
        await new Promise((resolve, reject) =>{
            db.query(sql, values, (err, result) =>{
                if(err) return reject(err);
                console.log(`Soft-deleted from ${table}: ${result.affectedRows} rows`);
                resolve();
            });
        });
        if(config.cascade){
            await processCascade(config.cascade, id);
        }
    }
}

export default db;