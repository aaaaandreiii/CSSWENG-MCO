import mysql from 'mysql2';

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456789', //change to your password
    database: 'mydb'//'dbdbdb'
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