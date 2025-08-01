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

export async function getFullOrderDetails() {
  const [rows] = await db.query(`
    SELECT 
      o.orderId,
      o.customer,
      o.dateOrdered AS orderDate,
      o.discount,
      o.handledBy,
      o.paymentMethod,
      o.paymentStatus,

      -- Product Ordered
      p.productId,
      p.productName,
      p.units,
      p.category,

      -- Order Info
      oi.orderInfoId,
      oi.quantity,
      oi.unitPriceAtPurchase,

      -- Return/Exchange Info (optional)
      rei.detailId,
      rei.returnedProductId,
      rei.returnedQuantity,
      rei.exchangeProductId,
      rei.exchangeQuantity,
      rei.reason,
      rei.returnType

    FROM Orders o
    JOIN OrderInfo oi ON o.orderId = oi.orderId AND oi.deleteFlag = 0
    JOIN Product p ON oi.productId = p.productId AND p.deleteFlag = 0
    LEFT JOIN ReturnExchangeInfo rei 
      ON o.orderId = rei.transactionId 
      AND rei.returnedProductId = p.productId
      AND rei.deleteFlag = 0

    WHERE o.deleteFlag = 0
    ORDER BY o.dateOrdered DESC, o.orderId DESC;
  `);
  return rows;
}

// Delete entire order and its items
export async function deleteOrder(orderId) {
  const [result] = await db.query(
    'UPDATE Orders SET deleteFlag = 1 WHERE orderId = ?',
    [orderId]
  );
  return result.affectedRows > 0;
}

export async function deleteOrderItem(orderInfoId) {
    try {
        const [result] = await db.query(
            'DELETE FROM order_info WHERE order_info_id = ?',
            [orderInfoId]
        );
        return result.affectedRows > 0;
    } catch (err) {
        console.error('Error deleting order item:', err);
        return false;
    }
}

export async function deleteAllOrderItems(orderId) {
  const [result] = await db.query(
    'UPDATE OrderInfo SET deleteFlag = 1 WHERE orderId = ?',
    [orderId]
  );
  return result.affectedRows > 0;
}