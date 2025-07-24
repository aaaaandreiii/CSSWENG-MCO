import db from "./db.js"

//CREATE
// export function createOrderInfo(quantity, orderId, productId, unitPriceAtPurchase, lastEditedDate, lastEditedUser, deleteFlag){
export async function createOrderInfo(quantity, orderId, productId, unitPriceAtPurchase, lastEditedDate, lastEditedUser, deleteFlag){
    const sql = 'INSERT INTO OrderInfo(quantity, orderId, productId, unitPriceAtPurchase, lastEditedDate, lastEditedUser, deleteFlag) VALUES (?, ?, ?, ?, ?, ?, ?)';
    // return new Promise((resolve, reject) =>{
    //     db.query(sql, [quantity, orderId, productId, unitPriceAtPurchase, lastEditedDate, lastEditedUser, deleteFlag], (err, result) =>{
    //         if(err) return reject(err);
    //         console.log("Order Info created: ", result.insertId);
    //         resolve(result.insertId);
    //     });
    // });
    const [result] = await db.query(sql, [
        quantity, orderId, productId, 
        unitPriceAtPurchase, lastEditedDate, 
        lastEditedUser, deleteFlag
    ]);
    console.log("Order Info created:", result.insertId);
    return result.insertId;
}

//READ: ORDER INFO
// export function getOrderInfo(){
export async function getOrderInfo(){
    // return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM OrderInfo WHERE deleteFlag = 0';
    //     db.query(sql, (err, results) =>{
    //         if(err) return reject(err);
    //         console.log("Order Info: ", results);
    //         resolve (results);
    //     });
    // });
    const [results] = await db.query(sql);
    console.log("Users:", results.length);
    return results;
}

// export function getOrderInfoById(orderInfoId){
export async function getOrderInfoById(orderInfoId){
    // return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM OrderInfo WHERE orderInfoId = ? AND deleteFlag = 0';
    //     db.query(sql, [orderInfoId], (err, results) =>{
    //         if(err) return reject(err);
    //         if(results.length > 0){
    //             console.log("Order Info found: ", results[0]);
    //             resolve(results[0]);
    //         }
    //         else{
    //             console.log('Order Info not found or already deleted.');
    //             resolve(null);
    //         }
    //     });
    // });
    const [results] = await db.query(sql, [orderInfoId]);
    if (results.length) {
        console.log("Order Info found:", results[0]);
        return results[0];
    } else {
        console.log("Order Info not found or already deleted.");
        return null;
    }
}

//UPDATE
// export function updateOrderInfoById(orderInfoId, updatedObject){
export async function updateOrderInfoById(orderInfoId, updatedObject){
    // return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE OrderInfo
            SET quantity = ?, 
                
                productId = ?,
                unitPriceAtPurchase = ?, 
                lastEditedDate = ?, 
                lastEditedUser = ?

            WHERE orderInfoId = ?
        `; //removed orderId, deleteFlag
        const values = [
            updatedObject.quantity,
            
            updatedObject.productId,
            updatedObject.unitPriceAtPurchase,
            updatedObject.lastEditedDate,
            updatedObject.lastEditedUser,
            
            orderInfoId
        ];
    //     db.query(sql, values, (err, result) =>{
    //         if(err) return reject(err);
    //         if(result.affectedRows > 0){
    //             console.log(`Order Info ${orderInfoId} updated succesfully: `, result);
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
            ? `Order Info ${orderInfoId} updated successfully: ${result}`
            : `No rows updated for Order Info entry ${orderInfoId}: ${result}`
    );
    return ok;
}

//DELETE
// export function deleteOrderInfoById(orderInfoId){
export async function deleteOrderInfoById(orderInfoId){
    // return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE OrderInfo
            SET deleteFlag = 1
            WHERE orderInfoId = ?
        `;
    //     db.query(sql, [orderInfoId], (err, result) =>{
    //         if(err) return reject(err);
    //         if(result.affectedRows > 0){
    //             console.log(`Order Info ${orderInfoId} soft-deleted succesfully: `, result);
    //             resolve(true);
    //         }
    //         else{
    //             console.log(`Nothing deleted: `, result);
    //             resolve(false);
    //         }
    //     });
    // });
    const [result] = await db.query(sql, [orderInfoId]);
    const ok = result.affectedRows > 0;
    console.log(
        ok
        ? `Order Info ${orderInfoId} soft-deleted successfully: ${result}`
        : `No rows deleted for Order Info entry ${orderInfoId}: ${result}`
    );
    return ok;
}