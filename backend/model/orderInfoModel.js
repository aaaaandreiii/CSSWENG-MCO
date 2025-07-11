import db from "./db.js"

//CREATE
export function createOrderInfo(quantity, orderId, productId, deleteFlag){
    const sql = 'INSERT INTO OrderInfo(quantity, orderId, productId, deleteFlag) VALUES (?, ?, ?, ?)';
    return new Promise((resolve, reject) =>{
        db.query(sql, [quantity, orderId, productId, deleteFlag], (err, result) =>{
            if(err) return reject(err);
            console.log("Order Info created: ", result.insertId);
            resolve(result.insertId);
        });
    });
}

//READ: ORDER INFO
export function getOrderInfo(){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM OrderInfo WHERE deleteFlag = 0';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Order Info: ", results);
            resolve (results);
        });
    });
}

export function getOrderInfoById(orderInfoId){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM OrderInfo WHERE orderInfoId = ? AND deleteFlag = 0';
        db.query(sql, [orderInfoId], (err, results) =>{
            if(err) return reject(err);
            if(results.length > 0){
                console.log("Order Info found: ", results[0]);
                resolve(results[0]);
            }
            else{
                console.log('Order Info not found or already deleted.');
                resolve(null);
            }
        });
    });
}

//UPDATE
export function updateOrderInfoById(orderInfoId, updatedObject){
    return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE OrderInfo
            SET quantity = ?, 
                
                productId = ?
                
            WHERE orderInfoId = ?
        `; //removed orderId, deleteFlag
        const values = [
            updatedObject.quantity,
            
            updatedObject.productId,
            
            orderInfoId
        ];
        db.query(sql, values, (err, result) =>{
            if(err) return reject(err);
            if(result.affectedRows > 0){
                console.log(`Order Info ${orderInfoId} updated succesfully: `, result);
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
export function deleteOrderInfoById(orderInfoId){
    return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE OrderInfo
            SET deleteFlag = 1
            WHERE orderInfoId = ?
        `;
        db.query(sql, [orderInfoId], (err, result) =>{
            if(err) return reject(err);
            if(result.affectedRows > 0){
                console.log(`Order Info ${orderInfoId} soft-deleted succesfully: `, result);
                resolve(true);
            }
            else{
                console.log(`Nothing deleted: `, result);
                resolve(false);
            }
        });
    });
}