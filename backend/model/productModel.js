import db from "./db.js"

//CREATE
export function createProduct(productName, category, descriptions, supplier, cost, retailPrice, deleteFlag){
    const sql = 'INSERT INTO Product(productName, category, descriptions, supplier, cost, retailPrice, deleteFlag) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [productName, category, descriptions, supplier, cost, retailPrice, deleteFlag], (err, result) =>{
        if(err) throw err;
        console.log("Product created: ", result.insertId);
        return result.insertId;
    });
}

//READ
export function getProducts(){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM Product WHERE deleteFlag = 0';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Products: ", results);
            resolve (results);
        });
    });
}

export function getProductById(productId){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM Product WHERE productId = ? AND deleteFlag = 0';
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

//UPDATE
export function updateProductById(productId, updatedObject){
    return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE Product
            SET productName = ?,
                category = ?,
                descriptions = ?,
                supplier = ?,
                cost = ?,
                retailPrice = ?,
                deleteFlag = ?
            WHERE productId = ?
        `;
        const values = [
            updatedObject.productName,
            updatedObject.category, 
            updatedObject.descriptions, 
            updatedObject.supplier, 
            updatedObject.cost, 
            updatedObject.retailPrice, 
            updatedObject.deleteFlag,
            productId
        ];
        db.query(sql, values, (err, result) =>{
            if(err) return reject(err);
            if(result.affectedRows > 0){
                console.log(`Product ${productId} updated succesfully: `, result);
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
export function deleteProductById(productId){
    return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE Product
            SET deleteFlag = 1
            WHERE productId = ?
        `;
        db.query(sql, [productId], (err, result) =>{
            if(err) return reject(err);
            if(result.affectedRows > 0){
                console.log(`Product ${productId} soft-deleted succesfully: `, result);
                resolve(true);
            }
            else{
                console.log(`Nothing happened: `, result);
                resolve(false);
            }
        });
    });
}

export async function cascadeDeleteProduct(productId){
    const deleted = await deleteProductById(productId);
    if(!deleted){
        return false;
    }
    const tables = [
        {
            table: 'StockEntry',
            where: 'productId = ?',
            values: [productId]
        },
        {
            table: 'OrderInfo',
            where: 'productId  = ?',
            values: [productId]
        },
        {
            table: 'ReturnExchangeInfo',
            where: 'returnedProductId = ? OR exchangeProductId = ?',
            values: [productId, productId]
        }
    ];

    for(const {table, where, values} of tables){
        await new Promise((resolve, reject) =>{
            const sql = `
                UPDATE ${table}
                SET deleteFlag = 1
                WHERE ${where}
            `;
            db.query(sql, values, (err, result) =>{
                if(err) return reject(err);
                resolve();
            });
        });
    }
    return true;
}