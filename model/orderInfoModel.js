import db from "./db.js"

//CREATE
export function createOrderInfo(quantity, orderId, productId){
    const sql = 'INSERT INTO OrderInfo(quantity, orderId, productId) VALUES (?, ?, ?)';
    return new Promise((resolve, reject) =>{
        db.query(sql, [quantity, orderId, productId], (err, result) =>{
            if(err) return reject(err);
            console.log("Order Info created: ", result.insertId);
            resolve(result.insertId);
        });
    });
}

//READ: ORDER INFO
export function getOrderInfo(){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM OrderInfo';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Order Info: ", results);
            resolve (results);
        });
    });
}

export function getOrderInfoById(orderInfoId){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM OrderInfo WHERE orderInfoId = ?';
        db.query(sql, [orderInfoId], (err, results) =>{
            if(err) return reject(err);
            if(results.length > 0){
                console.log("Order Info found: ", results[0]);
                resolve(results[0]);
            }
            else{
                console.log('Order Info not found.');
                resolve(null);
            }
        });
    });
}

//UPDATE

//DELETE