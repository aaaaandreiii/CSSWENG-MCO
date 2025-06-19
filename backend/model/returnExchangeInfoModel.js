import db from "./db.js"

//CREATE
export function createReturnExchangeInfo(returnedProductId, returnedQuantity, exchangeProductId, exchangeQuantity , reason, transactionId){
    const sql = 'INSERT INTO ReturnExchangeInfo(returnedProductId, returnedQuantity, exchangeProductId, exchangeQuantity , reason, transactionId) VALUES (?, ?, ?, ?, ?, ?)';
    return new Promise((resolve, reject) =>{
        db.query(sql, [returnedProductId, returnedQuantity, exchangeProductId, exchangeQuantity , reason, transactionId], (err, result) =>{
            if(err) return reject(err);
            console.log("Return Exchange Info created: ", result.insertId);
            resolve(result.insertId);
        });
    });
}

//READ: RETURN EXCHANGE INFO
export function getReturnExchangeInfo(){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM ReturnExchangeInfo';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Return Exchange Info: ", results);
            resolve (results);
        });
    });
}

export function getReturnExchangeInfoById(detailId){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM ReturnExchangeInfo WHERE detailId = ?';
        db.query(sql, [detailId], (err, results) =>{
            if(err) return reject(err);
            if(results.length > 0){
                console.log("Return Exchange Info found: ", results[0]);
                resolve(results[0]);
            }
            else{
                console.log('Return Exchange Info not found.');
                resolve(null);
            }
        });
    });
}

//UPDATE

//DELETE