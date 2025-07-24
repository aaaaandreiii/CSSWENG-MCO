import db, { processCascade } from "./db.js"

//CREATE
// export function createOrder(discount, customer, handledBy, paymentMethod, paymentStatus, lastEditedDate, lastEditedUser, dateOrdered, deleteFlag){
export async function createOrder(discount, customer, handledBy, paymentMethod, paymentStatus, lastEditedDate, lastEditedUser, dateOrdered, deleteFlag){
    const sql = 'INSERT INTO Orders(discount, customer, handledBy, paymentMethod, paymentStatus, lastEditedDate, lastEditedUser, dateOrdered, deleteFlag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    // return new Promise((resolve, reject) =>{
    //     db.query(sql, [discount, customer, handledBy, paymentMethod, paymentStatus, lastEditedDate, lastEditedUser, dateOrdered, deleteFlag], (err, result) =>{
    //         if(err) return reject(err);
    //         console.log("Orders created: ", result.insertId);
    //         resolve(result.insertId);
    //     });
    // });
    const [result] = await db.query(sql, [
        discount, customer, handledBy, 
        paymentMethod, paymentStatus, lastEditedDate, 
        lastEditedUser, dateOrdered, deleteFlag
    ]);
    console.log("Order created:", result.insertId);
    return result.insertId;
}

//READ: ORDERS
// export function getOrders(){
export async function getOrders(){
    // return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM Orders WHERE deleteFlag = 0';
    //     db.query(sql, (err, results) =>{
    //         if(err) return reject(err);
    //         console.log("Orders: ", results);
    //         resolve (results);
    //     });
    // });
    const [results] = await db.query(sql);
    console.log("Orders:", results.length);
    return results;
}

// export function getOrderById(orderId){
export async function getOrderById(orderId){
    // return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM Orders WHERE orderId = ? AND deleteFlag = 0';
    //     db.query(sql, [orderId], (err, results) =>{
    //         if(err) return reject(err);
    //         if(results.length > 0){
    //             console.log("Order found: ", results[0]);
    //             resolve(results[0]);
    //         }
    //         else{
    //             console.log('Order not found or already deleted.');
    //             resolve(null);
    //         }
    //     });
    // });
    const [results] = await db.query(sql, [orderId]);
    if (results.length) {
        console.log("Order found:", results[0]);
        return results[0];
    } else {
        console.log("Order entry not found or deleted.");
        return null;
    }
}

//UPDATE
// export function updateOrderById(orderId, updatedObject){
export async function updateOrderById(orderId, updatedObject){
    // return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE Orders
            SET discount = ?, 
                customer = ?, 
                handledBy = ?, 
                paymentMethod = ?, 
                paymentStatus = ?, 
                lastEditedDate = ?, 
                lastEditedUser = ?

            WHERE orderId = ?
        `;
        const values = [
            updatedObject.discount,
            updatedObject.customer,
            updatedObject.handledBy,
            updatedObject.paymentMethod,
            updatedObject.paymentStatus,
            updatedObject.lastEditedDate,
            updatedObject.lastEditedUser,

            orderId
        ];
    //     db.query(sql, values, (err, result) =>{
    //         if(err) return reject(err);
    //         if(result.affectedRows > 0){
    //             console.log(`Order ${orderId} updated succesfully: `, result);
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
            ? `Order ${orderId} updated successfully: ${result}`
            : `No rows updated for Order entry ${orderId}: ${result}`
    );
    return ok;
}

//DELETE
// export function deleteOrderById(orderId){
export async function deleteOrderById(orderId){
    // return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE Orders
            SET deleteFlag = 1
            WHERE orderId = ?
        `;
    //     db.query(sql, [orderId], (err, result) =>{
    //         if(err) return reject(err);
    //         if(result.affectedRows > 0){
    //             console.log(`Orders ${orderId} soft-deleted succesfully: `, result);
    //             resolve(true);
    //         }
    //         else{
    //             console.log(`Nothing deleted: `, result);
    //             resolve(false);
    //         }
    //     });
    // });
    const [result] = await db.query(sql, [orderId]);
    const ok = result.affectedRows > 0;
    console.log(
        ok
        ? `Orders ${orderId} soft-deleted successfully: ${result}`
        : `No rows deleted for Orders entry ${orderId}: ${result}`
    );
    return ok;
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