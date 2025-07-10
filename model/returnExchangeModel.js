import db from "./db.js"

//CREATE
export function createReturnExchange(dateTransaction, transactionStatus, orderId, handledBy, approvedBy){
    const sql = 'INSERT INTO ReturnExchange(dateTransaction, transactionStatus, orderId, handledBy, approvedBy) VALUES (?, ?, ?, ?, ?)';
    return new Promise((resolve, reject) =>{
        db.query(sql, [dateTransaction, transactionStatus, orderId, handledBy, approvedBy], (err, result) =>{
            if(err) return reject(err);
            console.log("Return Exchange created: ", result.insertId);
            resolve(result.insertId);
        });
    });
}

//READ: RETURN EXCHANGE
export function getReturnExchanges(){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM ReturnExchange';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Return Exchanges: ", results);
            resolve (results);
        });
    });
}

export function getReturnExchangeById(transactionId){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM ReturnExchange WHERE transactionId = ?';
        db.query(sql, [transactionId], (err, results) =>{
            if(err) return reject(err);
            if(results.length > 0){
                console.log("Return Exchange found: ", results[0]);
                resolve(results[0]);
            }
            else{
                console.log('Return Exchange not found.');
                resolve(null);
            }
        });
    });
}

//UPDATE

//DELETE