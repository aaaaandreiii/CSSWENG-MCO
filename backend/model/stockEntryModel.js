import db from "./db.js"

//CREATE
export function createStockEntry(branchName, dateReceived, quantityReceived, deliveryReceiptNumber, receivedBy, productId, deleteFlag){
    const sql = 'INSERT INTO StockEntry(branchName, dateReceived, quantityReceived, deliveryReceiptNumber, receivedBy, productId, deleteFlag) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [branchName, dateReceived, quantityReceived, deliveryReceiptNumber, receivedBy, productId, deleteFlag], (err, result) =>{
        if(err) throw err;
        console.log("Stock Entry created: ", result.insertId);
        return result.insertId;
    });
}

//READ
export function getStockEntries(){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM StockEntry';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Stock Entries: ", results);
            resolve (results);
        });
    });
}

export function getStockEntryById(entryId){
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

//UPDATE

//DELETE