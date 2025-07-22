import db from "./db.js"

//CREATE
// export function createReturnExchangeInfo(returnedProductId, returnedQuantity, exchangeProductId, exchangeQuantity , reason, transactionId, returnType, lastEditedDate, lastEditedUser, deleteFlag){
export async function createReturnExchangeInfo(returnedProductId, returnedQuantity, exchangeProductId, exchangeQuantity , reason, transactionId, returnType, lastEditedDate, lastEditedUser, deleteFlag){
    const sql = 'INSERT INTO ReturnExchangeInfo(returnedProductId, returnedQuantity, exchangeProductId, exchangeQuantity , reason, transactionId, returnType, lastEditedDate, lastEditedUser, deleteFlag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    // return new Promise((resolve, reject) =>{
    //     db.query(sql, [returnedProductId, returnedQuantity, exchangeProductId, exchangeQuantity , reason, transactionId, returnType, lastEditedDate, lastEditedUser, deleteFlag], (err, result) =>{
    //         if(err) return reject(err);
    //         console.log("Return Exchange Info created: ", result.insertId);
    //         resolve(result.insertId);
    //     });
    // });
    const [result] = await db.query(sql, [
        fullName, userRole, username, hashedPassword,
        pathName, dateAdded, lastEditedDate, lastEditedUser,
        deleteFlag
    ]);
    console.log("Return Exchange Info created:", result.insertId);
    return result.insertId;
}

//READ: RETURN EXCHANGE INFO
// export function getReturnExchangeInfo(){
export async function getReturnExchangeInfo(){
    // return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM ReturnExchangeInfo WHERE deleteFlag = 0';
    //     db.query(sql, (err, results) =>{
    //         if(err) return reject(err);
    //         console.log("Return Exchange Info: ", results);
    //         resolve (results);
    //     });
    // });
    const [results] = await db.query(sql);
    console.log("Return Exchange Info:", results);
    return results;
}

// export function getReturnExchangeInfoById(detailId){
export async function getReturnExchangeInfoById(detailId){
    // return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM ReturnExchangeInfo WHERE detailId = ? AND deleteFlag = 0';
    //     db.query(sql, [detailId], (err, results) =>{
    //         if(err) return reject(err);
    //         if(results.length > 0){
    //             console.log("Return Exchange Info found: ", results[0]);
    //             resolve(results[0]);
    //         }
    //         else{
    //             console.log('Return Exchange Info not found or already deleted.');
    //             resolve(null);
    //         }
    //     });
    // });
    const [results] = await db.query(sql, [detailId]);
    if (results.length) {
        console.log("Return Exchange Info found:", results[0]);
        return results[0];
    } else {
        console.log("Return Exchange Info not found or already deleted.");
        return null;
    }
}

//UPDATE
// export function updateReturnExchangeInfoById(detailId, updatedObject){
export async function updateReturnExchangeInfoById(detailId, updatedObject){
    // return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE ReturnExchangeInfo
            SET returnedProductId = ?, 
                returnedQuantity = ?, 
                exchangeProductId = ?, 
                exchangeQuantity = ?, 
                reason = ?, 
                
                returnType = ?, 
                lastEditedDate = ?, 
                lastEditedUser = ?
                
            WHERE detailId = ?
        `; //removed transactionId, deleteFlag
        const values = [
            updatedObject.returnedProductId,
            updatedObject.returnedQuantity, 
            updatedObject.exchangeProductId, 
            updatedObject.exchangeQuantity, 
            updatedObject.reason, 
             
            updatedObject.returnType,
            updatedObject.lastEditedDate,
            updatedObject.lastEditedUser,
            
            detailId
        ];
    //     db.query(sql, values, (err, result) =>{
    //         if(err) return reject(err);
    //         if(result.affectedRows > 0){
    //             console.log(`Return Exchange Info ${detailId} updated succesfully: `, result);
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
            ? `Return Exchange Info ${detailId} updated successfully: ${result}`
            : `No rows updated for Return Exchange Info ${detailId}: ${result}`
    );
    return ok;
}

//DELETE
// export function deleteReturnExchangeInfoById(detailId){
export async function deleteReturnExchangeInfoById(detailId){
    // return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE ReturnExchangeInfo
            SET deleteFlag = 1
            WHERE detailId = ?
        `;
    //     db.query(sql, [detailId], (err, result) =>{
    //         if(err) return reject(err);
    //         if(result.affectedRows > 0){
    //             console.log(`Return Exchange Info ${detailId} soft-deleted succesfully: `, result);
    //             resolve(true);
    //         }
    //         else{
    //             console.log(`Nothing deleted: `, result);
    //             resolve(false);
    //         }
    //     });
    // });
    const [result] = await db.query(sql, [detailId]);
    const ok = result.affectedRows > 0;
    console.log(
        ok
        ? `Return Exchange Info ${detailId} soft-deleted successfully: ${result}`
        : `No rows deleted for Return Exchange Info ${detailId}: ${result}`
    );
    return ok;
}