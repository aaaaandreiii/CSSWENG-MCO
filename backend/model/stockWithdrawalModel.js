import db from "./db.js"

//CREATE
export function createStockWithdrawal(dateWithdrawn, quantityWithdrawn, purpose, entryId, withdrawnBy, authorizedBy, lastEditedDate, lastEditedUser, deleteFlag){
    const sql = 'INSERT INTO StockWithdrawal(dateWithdrawn, quantityWithdrawn, purpose, entryId, withdrawnBy, authorizedBy, lastEditedDate, lastEditedUser, deleteFlag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    return new Promise((resolve, reject) =>{
        db.query(sql, [dateWithdrawn, quantityWithdrawn, purpose, entryId, withdrawnBy, authorizedBy, lastEditedDate, lastEditedUser, deleteFlag], (err, result) =>{
            if(err) return reject(err);
            console.log("Stock Withdrawal created: ", result.insertId);
            resolve(result.insertId);
        });
    });
}

//READ
export function getStockWithdrawals(){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM StockWithdrawal WHERE deleteFlag = 0';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Stock Withdrawals: ", results);
            resolve (results);
        });
    });
}

export function getStockWithdrawalById(withdrawalId){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM StockWithdrawal WHERE withdrawalId = ? AND deleteFlag = 0';
        db.query(sql, [withdrawalId], (err, results) =>{
            if(err) return reject(err);
            if(results.length > 0){
                console.log("Stock Withdrawal found: ", results[0]);
                resolve(results[0]);
            }
            else{
                console.log('Stock Withdrawal not found or already deleted.');
                resolve(null);
            }
        });
    });
}

//UPDATE
export function updateStockWithdrawalById(withdrawalId, updatedObject){
    return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE StockWithdrawal
            SET quantityWithdrawn = ?, 
                purpose = ?, 
                 
                withdrawnBy = ?, 
                authorizedBy = ?,
                lastEditedDate = ?, 
                lastEditedUser = ? 
                
            WHERE withdrawalId = ?
        `; //removed entryId, deleteFlag
        const values = [
            updatedObject.quantityWithdrawn,
            updatedObject.purpose,
            
            updatedObject.withdrawnBy,
            updatedObject.authorizedBy,
            updatedObject.lastEditedDate,
            updatedObject.lastEditedUser,
            
            withdrawalId
        ];
        db.query(sql, values, (err, result) =>{
            if(err) return reject(err);
            if(result.affectedRows > 0){
                console.log(`Stock Withdrawal ${withdrawalId} updated succesfully: `, result);
                resolve(true);
            }
            else{
                console.log(`Nothing updated: `, result);
                resolve(false);
            }
        });
    });
}

//DELETE
export function deleteStockWithdrawalById(withdrawalId){
    return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE StockWithdrawal
            SET deleteFlag = 1
            WHERE withdrawalId = ?
        `;
        db.query(sql, [withdrawalId], (err, result) =>{
            if(err) return reject(err);
            if(result.affectedRows > 0){
                console.log(`Stock Withdrawal ${withdrawalId} soft-deleted succesfully: `, result);
                resolve(true);
            }
            else{
                console.log(`Nothing deleted: `, result);
                resolve(false);
            }
        });
    });
}