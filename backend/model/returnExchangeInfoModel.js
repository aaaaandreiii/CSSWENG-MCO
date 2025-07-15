import db from "./db.js"

//CREATE
export function createReturnExchangeInfo(returnedProductId, returnedQuantity, exchangeProductId, exchangeQuantity , reason, transactionId, returnType, lastEditedDate, lastEditedUser, deleteFlag){
    const sql = 'INSERT INTO ReturnExchangeInfo(returnedProductId, returnedQuantity, exchangeProductId, exchangeQuantity , reason, transactionId, returnType, lastEditedDate, lastEditedUser, deleteFlag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    return new Promise((resolve, reject) =>{
        db.query(sql, [returnedProductId, returnedQuantity, exchangeProductId, exchangeQuantity , reason, transactionId, returnType, lastEditedDate, lastEditedUser, deleteFlag], (err, result) =>{
            if(err) return reject(err);
            console.log("Return Exchange Info created: ", result.insertId);
            resolve(result.insertId);
        });
    });
}

//READ: RETURN EXCHANGE INFO
export function getReturnExchangeInfo(){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM ReturnExchangeInfo WHERE deleteFlag = 0';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Return Exchange Info: ", results);
            resolve (results);
        });
    });
}

export function getReturnExchangeInfoById(detailId){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM ReturnExchangeInfo WHERE detailId = ? AND deleteFlag = 0';
        db.query(sql, [detailId], (err, results) =>{
            if(err) return reject(err);
            if(results.length > 0){
                console.log("Return Exchange Info found: ", results[0]);
                resolve(results[0]);
            }
            else{
                console.log('Return Exchange Info not found or already deleted.');
                resolve(null);
            }
        });
    });
}

//UPDATE
export function updateReturnExchangeInfoById(detailId, updatedObject){
    return new Promise((resolve, reject) =>{
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
        db.query(sql, values, (err, result) =>{
            if(err) return reject(err);
            if(result.affectedRows > 0){
                console.log(`Return Exchange Info ${detailId} updated succesfully: `, result);
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
export function deleteReturnExchangeInfoById(detailId){
    return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE ReturnExchangeInfo
            SET deleteFlag = 1
            WHERE detailId = ?
        `;
        db.query(sql, [detailId], (err, result) =>{
            if(err) return reject(err);
            if(result.affectedRows > 0){
                console.log(`Return Exchange Info ${detailId} soft-deleted succesfully: `, result);
                resolve(true);
            }
            else{
                console.log(`Nothing deleted: `, result);
                resolve(false);
            }
        });
    });
}