import db from "./db.js"

//CREATE
export function createStockWithdrawal(dateWithdrawn, quantityWithdrawn, purpose, entryId, withdrawnBy, authorizedBy, deleteFlag){
    const sql = 'INSERT INTO StockWithdrawal(dateWithdrawn, quantityWithdrawn, purpose, entryId, withdrawnBy, authorizedBy, deleteFlag) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [dateWithdrawn, quantityWithdrawn, purpose, entryId, withdrawnBy, authorizedBy, deleteFlag], (err, result) =>{
        if(err) throw err;
        console.log("Stock Withdrawal created: ", result.insertId);
        return result.insertId;
    });
}

//READ
export function getStockWithdrawals(){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM StockWithdrawal';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Stock Withdrawals: ", results);
            resolve (results);
        });
    });
}

export function getStockWithdrawalById(withdrawalId){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM StockWithdrawal WHERE withdrawalId = ?';
        db.query(sql, [withdrawalId], (err, results) =>{
            if(err) return reject(err);
            if(results.length > 0){
                console.log("Stock Withdrawal found: ", results[0]);
                resolve(results[0]);
            }
            else{
                console.log('Stock Withdrawal not found.');
                resolve(null);
            }
        });
    });
}

//UPDATE

//DELETE