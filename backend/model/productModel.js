import db, { processCascade } from "./db.js"

//CREATE
// export function createProduct(productName, category, descriptions, supplier, cost, retailPrice, stockOnHand, units, pathName, safeStockCount, restockFlag, lastEditedDate, lastEditedUser, deleteFlag){
export async function createProduct(productName, category, descriptions, supplier, cost, retailPrice, stockOnHand, units, pathName, safeStockCount, restockFlag, lastEditedDate, lastEditedUser, deleteFlag){
    const sql = 'INSERT INTO Product(productName, category, descriptions, supplier, cost, retailPrice, stockOnHand, units, pathName, safeStockCount, restockFlag, lastEditedDate, lastEditedUser, deleteFlag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    // return new Promise((resolve, reject) =>{
    //     db.query(sql, [productName, category, descriptions, supplier, cost, retailPrice, stockOnHand, units, pathName, safeStockCount, restockFlag, lastEditedDate, lastEditedUser, deleteFlag], (err, result) =>{
    //         if(err) return reject(err);
    //         console.log("Product created: ", result.insertId);
    //         resolve(result.insertId);
    //     });
    // });
    const [result] = await db.query(sql, [
        productName, category, descriptions, 
        supplier, cost, retailPrice, stockOnHand, 
        units, pathName, safeStockCount, restockFlag, 
        lastEditedDate, lastEditedUser, deleteFlag
    ]);
    console.log("Product created:", result.insertId);
    return result.insertId;
}

//READ
// export function getProducts(){
export async function getProducts(){
    // return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM Product WHERE deleteFlag = 0';
    //     db.query(sql, (err, results) =>{
    //         if(err) return reject(err);
    //         console.log("Products: ", results);
    //         resolve (results);
    //     });
    // });
    const [results] = await db.query(sql);
    console.log("Products:", results.length);
    return results;
}

// export function getProductById(productId){
export async function getProductById(productId){
    // return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM Product WHERE productId = ? AND deleteFlag = 0';
    //     db.query(sql, [productId], (err, results) =>{
    //         if(err) return reject(err);
    //         if(results.length > 0){
    //             console.log("Product found: ", results[0]);
    //             resolve(results[0]);
    //         }
    //         else{
    //             console.log('Product not found or already deleted.');
    //             resolve(null);
    //         }
    //     });
    // });
    const [results] = await db.query(sql, [productId]);
    if (results.length) {
        console.log("Product entry found:", results[0]);
        return results[0];
    } else {
        console.log("Product entry not found or already deleted.");
        return null;
    }
}

//UPDATE
// export function updateProductById(productId, updatedObject){
export async function updateProductById(productId, updatedObject){
    // return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE Product
            SET productName = ?,
                category = ?,
                descriptions = ?,
                supplier = ?,
                cost = ?,
                retailPrice = ?,
                stockOnHand = ?,
                units = ?,
                pathName = ?,
                safeStockCount = ?,
                restockFlag = ?,
                lastEditedDate = ?, 
                lastEditedUser =?

            WHERE productId = ?
        `;
        const values = [
            updatedObject.productName,
            updatedObject.category, 
            updatedObject.descriptions, 
            updatedObject.supplier, 
            updatedObject.cost, 
            updatedObject.retailPrice, 
            updatedObject.stockOnHand,
            updatedObject.units,
            updatedObject.pathName,
            updatedObject.safeStockCount, 
            updatedObject.restockFlag,
            updatedObject.lastEditedDate,
            updatedObject.lastEditedUser,
            
            productId
        ];
    //     db.query(sql, values, (err, result) =>{
    //         if(err) return reject(err);
    //         if(result.affectedRows > 0){
    //             console.log(`Product ${productId} updated succesfully: `, result);
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
            ? `Product ${productId} updated successfully: ${result}`
            : `No rows updated for Product entry ${productId}: ${result}`
    );
    return ok;
}

//DELETE
// export function deleteProductById(productId){
export async function deleteProductById(productId){
    // return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE Product
            SET deleteFlag = 1
            WHERE productId = ?
        `;
    //     db.query(sql, [productId], (err, result) =>{
    //         if(err) return reject(err);
    //         if(result.affectedRows > 0){
    //             console.log(`Product ${productId} soft-deleted succesfully: `, result);
    //             resolve(true);
    //         }
    //         else{
    //             console.log(`Nothing deleted: `, result);
    //             resolve(false);
    //         }
    //     });
    // });
    const [result] = await db.query(sql, [productId]);
    const ok = result.affectedRows > 0;
    console.log(
        ok
        ? `Product ${productId} soft-deleted successfully: ${result}`
        : `No rows deleted for Product entry ${productId}: ${result}`
    );
    return ok;
}

const productCascadeMap = {
    StockEntry: {
        where: 'productId = ?',
        values: (productId) => [productId],
        cascade: {
            StockWithdrawal: {
                where: 'entryId IN (SELECT entryId FROM StockEntry WHERE productId = ?)',
                values: (productId) => [productId]
            }
        }
    },
    OrderInfo: {
        where: 'productId = ?',
        values: (productId) => [productId],
    },
    ReturnExchangeInfo: {
        where: 'returnedProductId = ? OR exchangeProductId = ?',
        values: (productId) => [productId, productId],
    }
};

export async function cascadeDeleteProduct(productId){
    const deleted = await deleteProductById(productId);
    if(!deleted){
        return false;
    }
    await processCascade(productCascadeMap, productId)
    return true;
}