import db from "./db.js"

//CREATE
export function createOrders(discount, customer, handledBy, dateOrdered, deleteFlag){
    const sql = 'INSERT INTO Orders(discount, customer, handledBy, dateOrdered, deleteFlag) VALUES (?, ?, ?, ?, ?)';
    return new Promise((resolve, reject) =>{
        db.query(sql, [discount, customer, handledBy, dateOrdered, deleteFlag], (err, result) =>{
            if(err) return reject(err);
            console.log("Orders created: ", result.insertId);
            resolve(result.insertId);
        });
    });
}

//READ: ORDERS
export function getOrders(){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM Orders';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Orders: ", results);
            resolve (results);
        });
    });
}

export function getOrderById(orderId){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM Orders WHERE orderId = ?';
        db.query(sql, [orderId], (err, results) =>{
            if(err) return reject(err);
            if(results.length > 0){
                console.log("Order found: ", results[0]);
                resolve(results[0]);
            }
            else{
                console.log('Order not found.');
                resolve(null);
            }
        });
    });
}

//UPDATE

//DELETE