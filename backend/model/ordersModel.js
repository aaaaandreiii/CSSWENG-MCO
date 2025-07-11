import db, { processCascade } from "./db.js"

//CREATE
export function createOrder(discount, customer, handledBy, dateOrdered, deleteFlag){
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
        const sql = 'SELECT * FROM Orders WHERE deleteFlag = 0';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Orders: ", results);
            resolve (results);
        });
    });
}

export function getOrderById(orderId){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM Orders WHERE orderId = ? AND deleteFlag = 0';
        db.query(sql, [orderId], (err, results) =>{
            if(err) return reject(err);
            if(results.length > 0){
                console.log("Order found: ", results[0]);
                resolve(results[0]);
            }
            else{
                console.log('Order not found or already deleted.');
                resolve(null);
            }
        });
    });
}

//UPDATE
export function updateOrderById(orderId, updatedObject){
    return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE Orders
            SET discount = ?, 
                customer = ?, 
                handledBy = ? 
                
            WHERE orderId = ?
        `;
        const values = [
            updatedObject.discount,
            updatedObject.customer,
            updatedObject.handledBy,
            
            orderId
        ];
        db.query(sql, values, (err, result) =>{
            if(err) return reject(err);
            if(result.affectedRows > 0){
                console.log(`Order ${orderId} updated succesfully: `, result);
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
export function deleteOrderById(orderId){
    return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE Orders
            SET deleteFlag = 1
            WHERE orderId = ?
        `;
        db.query(sql, [orderId], (err, result) =>{
            if(err) return reject(err);
            if(result.affectedRows > 0){
                console.log(`Orders ${orderId} soft-deleted succesfully: `, result);
                resolve(true);
            }
            else{
                console.log(`Nothing deleted: `, result);
                resolve(false);
            }
        });
    });
}

const ordersCascadeMap = {
    OrderInfo: {
        where: 'orderId = ?',
        values: (orderId) => [orderId],
    },
    ReturnExchange: {
        where: 'orderId = ?',
        values: (orderId) => [orderId],
        cascade: {
            ReturnExchangeInfo: {
                where: 'transactionId IN (SELECT transactionId FROM ReturnExchange WHERE orderId = ?)',
                values: (orderId) => [orderId]
            }
        }
    }
};

export async function cascadeDeleteOrder(orderId){
    const deleted = await deleteOrderById(orderId);
    if(!deleted){
        return false;
    }
    await processCascade(ordersCascadeMap, orderId)
    return true;
}