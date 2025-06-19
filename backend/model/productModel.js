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
        const sql = 'SELECT * FROM Product';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Products: ", results);
            resolve (results);
        });
    });
}

export function getProductById(productId){
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