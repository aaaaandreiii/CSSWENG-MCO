import db from "./db.js"

//CREATE
// export function createStockWithdrawal(dateWithdrawn, quantityWithdrawn, purpose, entryId, withdrawnBy, authorizedBy, lastEditedDate, lastEditedUser, deleteFlag){
export async function createStockWithdrawal(dateWithdrawn, quantityWithdrawn, purpose, entryId, withdrawnBy, authorizedBy, lastEditedDate, lastEditedUser, deleteFlag){
    const sql = 'INSERT INTO StockWithdrawal(dateWithdrawn, quantityWithdrawn, purpose, entryId, withdrawnBy, authorizedBy, lastEditedDate, lastEditedUser, deleteFlag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    // return new Promise((resolve, reject) =>{
    //     db.query(sql, [dateWithdrawn, quantityWithdrawn, purpose, entryId, withdrawnBy, authorizedBy, lastEditedDate, lastEditedUser, deleteFlag], (err, result) =>{
    //         if(err) return reject(err);
            // console.log("Stock Withdrawal created: ", result.insertId);
    //         resolve(result.insertId);
    //     });
    // });
    const [result] = await db.query(sql, [
    dateWithdrawn, quantityWithdrawn, purpose, entryId, withdrawnBy, authorizedBy, lastEditedDate, lastEditedUser, deleteFlag
    ]);
    console.log("Stock Withdrawal created: ", result.insertId);
}

//READ
// export function getStockWithdrawals(){
export async function getStockWithdrawals(){
    // return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM StockWithdrawal WHERE deleteFlag = 0';
    //     db.query(sql, (err, results) =>{
    //         if(err) return reject(err);
    //         console.log("Stock Withdrawals: ", results);
    //         resolve (results);
    //     });
    // });
    const [results] = await db.query(sql);
    console.log("Stock Withdrawals: ", results);
    return results;
}

// export function getStockWithdrawalById(withdrawalId){
export async function getStockWithdrawalById(withdrawalId){
    // return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM StockWithdrawal WHERE withdrawalId = ? AND deleteFlag = 0';
    //     db.query(sql, [withdrawalId], (err, results) =>{
    //         if(err) return reject(err);
    //         if(results.length > 0){
    //             console.log("Stock Withdrawal found: ", results[0]);
    //             resolve(results[0]);
    //         }
    //         else{
    //             console.log('Stock Withdrawal not found or already deleted.');
    //             resolve(null);
    //         }
    //     });
    // });
    const [results] = await db.query(sql, [withdrawalId]);
    if (results.length) {
        console.log("Stock Withdrawal found: ", results[0]);
        return results[0];
    } else {
        console.log('Stock Withdrawal not found or already deleted.');
        return null;
    }
}

//UPDATE
// export function updateStockWithdrawalById(withdrawalId, updatedObject){
export async function updateStockWithdrawalById(withdrawalId, updatedObject){
    // return new Promise((resolve, reject) =>{
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
    //     db.query(sql, values, (err, result) =>{
    //         if(err) return reject(err);
    //         if(result.affectedRows > 0){
    //             console.log(`Stock Withdrawal ${withdrawalId} updated succesfully: `, result);
    //             resolve(true);
    //         }
    //         else{
    //             console.log(`Nothing updated: `, result);
    //             resolve(false);
    //         }
    //     });
    // });
    const [result] = await db.query(sql, values);
    const ok = result.affectedRows > 0;
    console.log(
        ok
            ? `Stock Withdrawal ${withdrawalId} updated successfully: ${result}`
            : `No rows updated for entry ${withdrawalId}: ${result}`
    );
    return ok;
}

//DELETE
// export function deleteStockWithdrawalById(withdrawalId){
export async function deleteStockWithdrawalById(withdrawalId){
    // return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE StockWithdrawal
            SET deleteFlag = 1
            WHERE withdrawalId = ?
        `;
    //     db.query(sql, [withdrawalId], (err, result) =>{
    //         if(err) return reject(err);
    //         if(result.affectedRows > 0){
    //             console.log(`Stock Withdrawal ${withdrawalId} soft-deleted succesfully: `, result);
    //             resolve(true);
    //         }
    //         else{
    //             console.log(`Nothing deleted: `, result);
    //             resolve(false);
    //         }
    //     });
    // });
    const [result] = await db.query(sql, [userId]);
    const ok = result.affectedRows > 0;
    console.log(
        ok
        ? `Stock Withdrawal ${withdrawalId} soft-deleted succesfully: ${result}`
        : `No rows deleted for entry ${withdrawalId}: ${result}`
    );
    return ok;
}