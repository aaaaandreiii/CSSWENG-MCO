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
        const sql = 'SELECT * FROM StockEntry WHERE deleteFlag = 0';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Stock Entries: ", results);
            resolve (results);
        });
    });
}

export function getStockEntryById(entryId){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM StockEntry WHERE entryId = ? AND deleteFlag = 0';
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
export function updateStockEntryById(entryId, updatedObject){
    return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE StockEntry
            SET branchName = ?, 
                quantityReceived = ?, 
                deliveryReceiptNumber = ?, 
                receivedBy = ?, 
                productId = ?, 
                deleteFlag = ?
            WHERE entryId = ?
        `;
        const values = [
            updatedObject.branchName, 
            updatedObject.quantityReceived, 
            updatedObject.deliveryReceiptNumber, 
            updatedObject.receivedBy, 
            updatedObject.productId, 
            updatedObject.deleteFlag,
            entryId
        ];
        db.query(sql, values, (err, result) =>{
            if(err) return reject(err);
            if(result.affectedRows > 0){
                console.log(`Stock Entry ${entryId} updated succesfully: `, result);
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
export function deleteStockEntryById(entryId){
    return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE StockEntry
            SET deleteFlag = 1
            WHERE entryId = ?
        `;
        db.query(sql, [entryId], (err, result) =>{
            if(err) return reject(err);
            if(result.affectedRows > 0){
                console.log(`Stock Entry ${entryId} soft-deleted succesfully: `, result);
                resolve(true);
            }
            else{
                console.log(`Nothing happened: `, result);
                resolve(false);
            }
        });
    });
}

export async function cascadeDeleteStockEntry(entryId){
    const deleted = await deleteStockEntryById(entryId);
    if(!deleted){
        return false;
    }
    const tables = [
        {
            table: 'StockWithdrawal',
            where: 'entryId = ?',
            values: [entryId]
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