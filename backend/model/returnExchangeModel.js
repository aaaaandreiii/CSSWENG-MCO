import db, { processCascade } from "./db.js"

//CREATE
// export function createReturnExchange(dateTransaction, transactionStatus, orderId, handledBy, approvedBy, lastEditedDate, lastEditedUser, deleteFlag){
export async function createReturnExchange(dateTransaction, transactionStatus, orderId, handledBy, approvedBy, lastEditedDate, lastEditedUser, deleteFlag){
    const sql = 'INSERT INTO ReturnExchange(dateTransaction, transactionStatus, orderId, handledBy, approvedBy, lastEditedDate, lastEditedUser, deleteFlag) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    // return new Promise((resolve, reject) =>{
    //     db.query(sql, [dateTransaction, transactionStatus, orderId, handledBy, approvedBy, lastEditedDate, lastEditedUser, deleteFlag], (err, result) =>{
    //         if(err) return reject(err);
    //         console.log("Return Exchange created: ", result.insertId);
    //         resolve(result.insertId);
    //     });
    // });
    const [result] = await db.query(sql, [
        dateTransaction, transactionStatus, orderId, 
        handledBy, approvedBy, lastEditedDate, 
        lastEditedUser, deleteFlag
    ]);
    console.log("Return Exchange created:", result.insertId);
    return result.insertId;
}

//READ: RETURN EXCHANGE
// export function getReturnExchanges(){
export async function getReturnExchanges(){
    // return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM ReturnExchange WHERE deleteFlag = 0';
    //     db.query(sql, (err, results) =>{
    //         if(err) return reject(err);
    //         console.log("Return Exchanges: ", results);
    //         resolve (results);
    //     });
    // });
    const [results] = await db.query(sql);
    console.log("Return Exchanges:", results);
    return results;
}

// export function getReturnExchangeById(transactionId){
export async function getReturnExchangeById(transactionId){
    // return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM ReturnExchange WHERE transactionId = ? AND deleteFlag = 0';
    //     db.query(sql, [transactionId], (err, results) =>{
    //         if(err) return reject(err);
    //         if(results.length > 0){
    //             console.log("Return Exchange found: ", results[0]);
    //             resolve(results[0]);
    //         }
    //         else{
    //             console.log('Return Exchange not found or already deleted.');
    //             resolve(null);
    //         }
    //     });
    // });
    const [results] = await db.query(sql, [transactionId]);
    if (results.length) {
        console.log("Return Exchange found:", results[0]);
        return results[0];
    } else {
        console.log("Return Exchange not found or already deleted.");
        return null;
    }
}

//UPDATE
// export function updateReturnExchangeById(transactionId, updatedObject){
export async function updateReturnExchangeById(transactionId, updatedObject){
    // return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE ReturnExchange
            SET transactionStatus = ?, 
                 
                handledBy = ?, 
                approvedBy = ?,
                lastEditedDate = ?, 
                lastEditedUser = ?
                
            WHERE transactionId = ?
        `; //removed orderId, deleteFlag
        const values = [
            updatedObject.transactionStatus,
            
            updatedObject.handledBy,
            updatedObject.approvedBy,
            updatedObject.lastEditedDate,
            updatedObject.lastEditedUser,

            transactionId
        ];
    //     db.query(sql, values, (err, result) =>{
    //         if(err) return reject(err);
    //         if(result.affectedRows > 0){
    //             console.log(`Return Exchange ${transactionId} updated succesfully: `, result);
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
            ? `Return Exchange Transaction ${transactionId} updated successfully: ${result}`
            : `No rows updated for Return Exchange Transaction ${transactionId}: ${result}`
    );
    return ok;
}

//DELETE
// export function deleteReturnExchangeById(transactionId){
export async  function deleteReturnExchangeById(transactionId){
    // return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE ReturnExchange
            SET deleteFlag = 1
            WHERE transactionId = ?
        `;
    //     db.query(sql, [transactionId], (err, result) =>{
    //         if(err) return reject(err);
    //         if(result.affectedRows > 0){
    //             console.log(`Return Exchange ${transactionId} soft-deleted succesfully: `, result);
    //             resolve(true);
    //         }
    //         else{
    //             console.log(`Nothing deleted: `, result);
    //             resolve(false);
    //         }
    //     });
    // });
    const [result] = await db.query(sql, [transactionId]);
    const ok = result.affectedRows > 0;
    console.log(
        ok
        ? `Return Exchange Transaction ${transactionId} soft-deleted successfully: ${result}`
        : `No rows deleted for Return Exchange ${transactionId}: ${result}`
    );
    return ok;
}

const ReturnExchangeCascadeMap = {
    ReturnExchangeInfo: {
        where: 'transactionId = ?',
        values: (transactionId) => [transactionId],
    }
};

export async function cascadeDeleteReturnExchange(transactionId){
    const deleted = await deleteReturnExchangeById(transactionId);
    if(!deleted){
        return false;
    }
    await processCascade(ReturnExchangeCascadeMap, transactionId)
    return true;
}