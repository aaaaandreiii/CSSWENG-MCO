import db from "./db.js"

//CREATE
export function createReturnExchange(dateTransaction, transactionStatus, orderId, handledBy, approvedBy, deleteFlag){
    const sql = 'INSERT INTO ReturnExchange(dateTransaction, transactionStatus, orderId, handledBy, approvedBy, deleteFlag) VALUES (?, ?, ?, ?, ?, ?)';
    return new Promise((resolve, reject) =>{
        db.query(sql, [dateTransaction, transactionStatus, orderId, handledBy, approvedBy, deleteFlag], (err, result) =>{
            if(err) return reject(err);
            console.log("Return Exchange created: ", result.insertId);
            resolve(result.insertId);
        });
    });
}

//READ: RETURN EXCHANGE
export function getReturnExchanges(){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM ReturnExchange WHERE deleteFlag = 0';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Return Exchanges: ", results);
            resolve (results);
        });
    });
}

export function getReturnExchangeById(transactionId){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM ReturnExchange WHERE transactionId = ? AND deleteFlag = 0';
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

//UPDATE
export function updateReturnExchangeById(transactionId, updatedObject){
    return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE ReturnExchange
            SET transactionStatus = ?, 
                orderId = ?, 
                handledBy = ?, 
                approvedBy = ?,
                deleteFlag = ?
            WHERE transactionId = ?
        `;
        const values = [
            updatedObject.transactionStatus,
            updatedObject.orderId,
            updatedObject.handledBy,
            updatedObject.approvedBy,
            updatedObject.deleteFlag,
            transactionId
        ];
        db.query(sql, values, (err, result) =>{
            if(err) return reject(err);
            if(result.affectedRows > 0){
                console.log(`Return Exchange ${transactionId} updated succesfully: `, result);
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
export function deleteReturnExchangeById(transactionId){
    return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE ReturnExchange
            SET deleteFlag = 1
            WHERE transactionId = ?
        `;
        db.query(sql, [transactionId], (err, result) =>{
            if(err) return reject(err);
            if(result.affectedRows > 0){
                console.log(`Return Exchange ${transactionId} soft-deleted succesfully: `, result);
                resolve(true);
            }
            else{
                console.log(`Nothing happened: `, result);
                resolve(false);
            }
        });
    });
}

export async function cascadeDeleteReturnExchange(transactionId){
    const deleted = await deleteReturnExchangeById(transactionId);
    if(!deleted){
        return false;
    }
    const tables = [
        {
            table: 'ReturnExchangeInfo',
            where: 'transactionId = ?',
            values: [transactionId]
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