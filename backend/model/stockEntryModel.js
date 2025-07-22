import db, { processCascade } from "./db.js"

//CREATE
// export function createStockEntry(branchName, dateReceived, quantityReceived, deliveryReceiptNumber, receivedBy, productId, lastEditedDate, lastEditedUser, deleteFlag){
export async function createStockEntry(branchName, dateReceived, quantityReceived, deliveryReceiptNumber, receivedBy, productId, lastEditedDate, lastEditedUser, deleteFlag){
    const sql = 'INSERT INTO StockEntry(branchName, dateReceived, quantityReceived, deliveryReceiptNumber, receivedBy, productId, lastEditedDate, lastEditedUser, deleteFlag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    // return new Promise((resolve, reject) =>{
    //     db.query(sql, [branchName, dateReceived, quantityReceived, deliveryReceiptNumber, receivedBy, productId, lastEditedDate, lastEditedUser, deleteFlag], (err, result) =>{
    //         if(err) return reject(err);
    //         console.log("Stock Entry created: ", result.insertId);
    //         resolve(result.insertId);
    //     });
    // });
    const [result] = await db.query(sql, [
        branchName, dateReceived, quantityReceived, 
        deliveryReceiptNumber, receivedBy, productId, 
        lastEditedDate, lastEditedUser, deleteFlag
    ]);
    console.log("Stock Entry created: ", result.insertId);
    return result.insertId;
}

//READ
// export function getStockEntries(){
export async function getStockEntries(){
    // return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM StockEntry WHERE deleteFlag = 0';
    //     db.query(sql, (err, results) =>{
    //         if(err) return reject(err);
    //         console.log("Stock Entries: ", results);
    //         resolve (results);
    //     });
    // });
    const [results] = await db.query(sql);
    console.log("Stock Entries: ", results);
    return results;
}

// export function getStockEntryById(entryId){
export async function getStockEntryById(entryId){
    // return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM StockEntry WHERE entryId = ? AND deleteFlag = 0';
    //     db.query(sql, [entryId], (err, results) =>{
    //         if(err) return reject(err);
    //         if(results.length > 0){
    //             console.log("Stock Entry found: ", results[0]);
    //             resolve(results[0]);
    //         }
    //         else{
    //             console.log('Stock Entry not found or already deleted.');
    //             resolve(null);
    //         }
    //     });
    // });
    const [results] = await db.query(sql, [entryId]);
    if (results.length) {
        console.log("Stock Entry found: ", results[0]);
        return results[0];
    } else {
        console.log("Stock Entry not found or already deleted.");
        return null;
    }
}

//UPDATE
// export function updateStockEntryById(entryId, updatedObject){
export async function updateStockEntryById(entryId, updatedObject){
    // return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE StockEntry
            SET branchName = ?, 
                quantityReceived = ?, 
                deliveryReceiptNumber = ?, 
                receivedBy = ?,
                lastEditedDate = ?, 
                lastEditedUser = ?
                
            WHERE entryId = ?
        `; // removed productId, deleteFlag
        const values = [
            updatedObject.branchName, 
            updatedObject.quantityReceived, 
            updatedObject.deliveryReceiptNumber, 
            updatedObject.receivedBy, 
            updatedObject.lastEditedDate,
            updatedObject.lastEditedUser,
            
            entryId
        ];
    //     db.query(sql, values, (err, result) =>{
    //         if(err) return reject(err);
    //         if(result.affectedRows > 0){
    //             console.log(`Stock Entry ${entryId} updated succesfully: `, result);
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
            ? `Stock Entry ${entryId} updated succesfully: ${result}`
            : `No rows updated for entry ${entryId}: ${result}`
    );
    return ok;
}

//DELETE
// export function deleteStockEntryById(entryId){
export async function deleteStockEntryById(entryId){
    // return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE StockEntry
            SET deleteFlag = 1
            WHERE entryId = ?
        `;
    //     db.query(sql, [entryId], (err, result) =>{
    //         if(err) return reject(err);
    //         if(result.affectedRows > 0){
    //             console.log(`Stock Entry ${entryId} soft-deleted succesfully: `, result);
    //             resolve(true);
    //         }
    //         else{
    //             console.log(`Nothing deleted: `, result);
    //             resolve(false);
    //         }
    //     });
    // });
    const [result] = await db.query(sql, [entryId]);
    const ok = result.affectedRows > 0;
    console.log(
        ok
        ? `Stock Entry ${entryId} soft-deleted successfully: ${result}`
        : `No rows deleted for entry ${entryId}: ${result}`
    );
    return ok;
}
const stockEntryCascadeMap = {
    StockWithdrawal: {
        where: 'entryId = ?',
        values: (entryId) => [entryId],
    }
};

export async function cascadeDeleteStockEntry(entryId){
    const deleted = await deleteStockEntryById(entryId);
    if(!deleted){
        return false;
    }
    await processCascade(stockEntryCascadeMap, entryId)
    return true;
}