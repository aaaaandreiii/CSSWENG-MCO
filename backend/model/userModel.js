import db from "./db.js"
import argon2 from 'argon2';

//CREATE
export async function createUser(fullName, userRole, username, userPassword, dateAdded, deleteFlag){
    const hashedPassword = await argon2.hash(userPassword);
    const sql = 'INSERT INTO Users(fullName, userRole, username, userPassword, dateAdded, deleteFlag) VALUES (?, ?, ?, ?, ?, ?)';
    const result = await new Promise((resolve, reject) => {
        db.query(sql, [fullName, userRole, username, hashedPassword, dateAdded, deleteFlag], (err, result) =>{
            if(err) return reject(err);
            resolve(result);
        });
    });
    console.log("User created:", result.insertId);
    return result.insertId;
}

//READ
export function getUsers(){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM Users WHERE deleteFlag = 0';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Users: ", results);
            resolve (results);
        });
    });
}

export function getUserById(userId){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM Users WHERE userId = ? AND deleteFlag = 0';
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

//UPDATE
export async function updateUsersById(userId, updatedObject){
    const hashedPassword = await argon2.hash(updatedObject.userPassword);
    return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE Users
            SET fullName = ?, 
                userRole = ?, 
                username = ?, 
                userPassword = ?, 
                deleteFlag = ?
            WHERE userId = ?
        `;
        const values = [
            updatedObject.fullName,
            updatedObject.userRole, 
            updatedObject.username, 
            hashedPassword, 
            updatedObject.deleteFlag,
            userId
        ];
        db.query(sql, values, (err, result) =>{
            if(err) return reject(err);
            if(result.affectedRows > 0){
                console.log(`Users ${userId} updated succesfully: `, result);
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
export function deleteUsersById(userId){
    return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE Users
            SET deleteFlag = 1
            WHERE userId = ?
        `;
        db.query(sql, [userId], (err, result) =>{
            if(err) return reject(err);
            if(result.affectedRows > 0){
                console.log(`Users ${userId} soft-deleted succesfully: `, result);
                resolve(true);
            }
            else{
                console.log(`Nothing happened: `, result);
                resolve(false);
            }
        });
    });
}

export async function cascadeDeleteUsers(userId){
    const deleted = await deleteUsersById(userId);
    if(!deleted){
        return false;
    }
    const tables = [
        {
            table: 'StockEntry',
            where: 'receivedBy = ?',
            values: [userId]
        },
        {
            table: 'StockWithdrawal',
            where: 'withdrawnBy = ? OR authorizedBy = ?',
            values: [userId, userId]
        },
        {
            table: 'Orders',
            where: 'handledBy = ?',
            values: [userId]
        },
        {
            table: 'ReturnExchange',
            where: 'handledBy = ? OR approvedBy = ?',
            values: [userId, userId]
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