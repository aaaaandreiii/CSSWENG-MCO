const mysql = require('mysql2');
const argon2 = require('argon2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456789', //change to your password
    database: 'mydb'//'dbdbdb'
});

db.connect(err =>{
    if(err) throw err;
    console.log("connected!");
});

//CREATE
async function createUser(fullName, userRole, username, userPassword, dateAdded, userStatus){
    const hashedPassword = await argon2.hash(userPassword);
    const sql = 'INSERT INTO Users(fullName, userRole, username, userPassword, dateAdded, userStatus) VALUES (?, ?, ?, ?, ?, ?)';
    const result = await new Promise((resolve, reject) => {
        db.query(sql, [fullName, userRole, username, hashedPassword, dateAdded, userStatus], (err, result) =>{
            if(err) return reject(err);
            resolve(result);
        });
    });
    console.log("User created:", result.insertId);
}

function createProduct(productName, category, descriptions, supplier, productStatus, cost, retailPrice, units){
    const sql = 'INSERT INTO Product(productName, category, descriptions, supplier, productStatus, cost, retailPrice, units) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [productName, category, descriptions, supplier, productStatus, cost, retailPrice, units], (err, result) =>{
        if(err) throw err;
        console.log("Product created: ", result.insertId);
        return result.insertId;
    });
}

function createStockEntry(branchName, dateReceived, quantityReceived, deliveryReceiptNumber, receivedBy, productId){
    const sql = 'INSERT INTO StockEntry(branchName, dateReceived, quantityReceived, deliveryReceiptNumber, receivedBy, productId) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [branchName, dateReceived, quantityReceived, deliveryReceiptNumber, receivedBy, productId], (err, result) =>{
        if(err) throw err;
        console.log("Stock Entry created: ", result.insertId);
    });
}

function createStockWithdrawal(dateWithdrawn, quantityWithdrawn, purpose, productId, withdrawnBy, authorizedBy, stockEntryId){
    const sql = 'INSERT INTO StockWithdrawal(dateWithdrawn, quantityWithdrawn, purpose, productId, withdrawnBy, authorizedBy, stockEntryId) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [dateWithdrawn, quantityWithdrawn, purpose, productId, withdrawnBy, authorizedBy, stockEntryId], (err, result) =>{
        if(err) throw err;
        console.log("Stock Withdrawal created: ", result.insertId);
    });
}

function createOrders(discount, customer, handledBy, totalAmount, paymentMethod, paymentStatus){
    const sql = 'INSERT INTO Orders(discount, customer, handledBy, totalAmount, paymentMethod, paymentStatus) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [discount, customer, handledBy, totalAmount, paymentMethod, paymentStatus], (err, result) =>{
        if(err) throw err;
        console.log("Orders created: ", result.insertId);
    });
}

function createOrderInfo(quantity, orderId, productId, unitPriceAtPurchase){
    const sql = 'INSERT INTO OrderInfo(quantity, orderId, productId, unitPriceAtPurchase) VALUES (?, ?, ?, ?)';
    db.query(sql, [quantity, orderId, productId, unitPriceAtPurchase], (err, result) =>{
        if(err) throw err;
        console.log("Order Info created: ", result.insertId);
    });
}

function createReturnExchange(dateTransaction, transactionStatus, orderId, handledBy, approvedBy){
    const sql = 'INSERT INTO ReturnExchange(dateTransaction, transactionStatus, orderId, handledBy, approvedBy) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [dateTransaction, transactionStatus, orderId, handledBy, approvedBy], (err, result) =>{
        if(err) throw err;
        console.log("Return Exchange created: ", result.insertId);
    });
}

function createReturnExchangeInfo(returnedProductId, returnedQuantity, exchangeProductId, exchangeQuantity , reason, transactionId, returnType){
    const sql = 'INSERT INTO ReturnExchangeInfo(returnedProductId, returnedQuantity, exchangeProductId, exchangeQuantity , reason, transactionId, returnType) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [returnedProductId, returnedQuantity, exchangeProductId, exchangeQuantity , reason, transactionId, returnType], (err, result) =>{
        if(err) throw err;
        console.log("Return Exchange Info created: ", result.insertId);
    });
}


//READ: USERS
function getUsers(){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM Users';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Users: ", results);
            resolve (results);
        });
    });
}

function getUserById(userId){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM Users WHERE userId = ?';
        db.query(sql, [userId], (err, results) =>{
            if(err) return reject(err);
            if(results.length > 0){
                console.log("User found: ", results[0]);
                resolve(results[0]);
            }
            else{
                console.log('User not found.');
                resolve(null);
            }
        });
    });

}

//READ: PRODUCT
function getProducts(){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM Product';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Products: ", results);
            resolve (results);
        });
    });
}

function getProductById(productId){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM Product WHERE productId = ?';
        db.query(sql, [productId], (err, results) =>{
            if(err) return reject(err);
            if(results.length > 0){
                console.log("Product found: ", results[0]);
                resolve(results[0]);
            }
            else{
                console.log('Product not found.');
                resolve(null);
            }
        });
    });
}

//READ: StockEntry
function getStockEntries(){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM StockEntry';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Stock Entries: ", results);
            resolve (results);
        });
    });
}

function getStockEntryById(entryId){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM StockEntry WHERE entryId = ?';
        db.query(sql, [entryId], (err, results) =>{
            if(err) return reject(err);
            if(results.length > 0){
                console.log("Stock Entry found: ", results[0]);
                resolve(results[0]);
            }
            else{
                console.log('Stock Entry not found.');
                resolve(null);
            }
        });
    });
}

//READ: StockWithdrawal
function getStockWithdrawals(){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM StockWithdrawal';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Stock Withdrawals: ", results);
            resolve (results);
        });
    });
}

function getStockWithdrawalById(withdrawalId){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM StockWithdrawal WHERE withdrawalId = ?';
        db.query(sql, [withdrawalId], (err, results) =>{
            if(err) return reject(err);
            if(results.length > 0){
                console.log("Stock Withdrawal found: ", results[0]);
                resolve(results[0]);
            }
            else{
                console.log('Stock Withdrawal not found.');
                resolve(null);
            }
        });
    });
}

//READ: ORDERS
function getOrders(){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM Orders';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Orders: ", results);
            resolve (results);
        });
    });
}

function getOrderById(orderId){
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

//READ: ORDER INFO
function getOrderInfo(){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM OrderInfo';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Order Info: ", results);
            resolve (results);
        });
    });
}

function getOrderInfoById(orderInfoId){
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

//READ: RETURN EXCHANGE
function getReturnExchanges(){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM ReturnExchange';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Return Exchanges: ", results);
            resolve (results);
        });
    });
}

function getReturnExchangeById(transactionId){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM ReturnExchange WHERE transactionId = ?';
        db.query(sql, [transactionId], (err, results) =>{
            if(err) return reject(err);
            if(results.length > 0){
                console.log("Return Exchange found: ", results[0]);
                resolve(results[0]);
            }
            else{
                console.log('Return Exchange not found.');
                resolve(null);
            }
        });
    });
}

//READ: RETURN EXCHANGE INFO
function getReturnExchangeInfo(){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM ReturnExchangeInfo';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Return Exchange Info: ", results);
            resolve (results);
        });
    });
}

function getReturnExchangeInfoById(detailId){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM ReturnExchangeInfo WHERE detailId = ?';
        db.query(sql, [detailId], (err, results) =>{
            if(err) return reject(err);
            if(results.length > 0){
                console.log("Return Exchange Info found: ", results[0]);
                resolve(results[0]);
            }
            else{
                console.log('Return Exchange Info not found.');
                resolve(null);
            }
        });
    });
}

//UPDATE

//DELETE

module.exports = {
    createUser,
    createProduct,
    createStockEntry,
    createStockWithdrawal,
    createOrders,
    createOrderInfo,
    createReturnExchange,
    createReturnExchangeInfo,
    getUsers,
    getUserById,
    getProducts,
    getProductById,
    getStockEntries,
    getStockEntryById,
    getStockWithdrawals,
    getStockWithdrawalById,
    getOrders,
    getOrderById,
    getOrderInfo,
    getOrderInfoById,
    getReturnExchanges,
    getReturnExchangeById,
    getReturnExchangeInfo,
    getReturnExchangeInfoById
};