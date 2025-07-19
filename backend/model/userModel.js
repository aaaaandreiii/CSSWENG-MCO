import db, { processCascade } from "./db.js"
import argon2 from 'argon2';

//CREATE
export async function createUser(fullName, userRole, username, userPassword, pathName, dateAdded, lastEditedDate, lastEditedUser, deleteFlag){
    const hashedPassword = await argon2.hash(userPassword);
    const sql = 'INSERT INTO Users(fullName, userRole, username, userPassword, pathName, dateAdded, lastEditedDate, lastEditedUser, deleteFlag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const result = await new Promise((resolve, reject) => {
        db.query(sql, [fullName, userRole, username, hashedPassword, pathName, dateAdded, lastEditedDate, lastEditedUser, deleteFlag], (err, result) =>{
            if(err) return reject(err);
            resolve(result);
        });
    });
    console.log("User created:", result.insertId);
    return result.insertId;
}

//BOOTSTRAP
export async function bootstrapAdminUser() {
    const checkSql = `SELECT COUNT(*) AS count FROM Users WHERE userRole = 'admin' AND deleteFlag = 0`;
    const result = await new Promise((resolve, reject) => {
        db.query(checkSql, (err, rows) => {
            if (err) return reject(err);
            resolve(rows[0]);
        });
    });

    if (result.count === 0) {
        const fullName = "System Admin";
        const userRole = "admin";
        const username = "admin";
        const userPassword = "123456789";
        const pathName = "";

        const dateAdded = new Date().toISOString().split("T")[0];
        const lastEditedDate = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        const lastEditedUser = 0;
        const deleteFlag = 0;

        const hashedPassword = await argon2.hash(userPassword);

        const insertSql = `
            INSERT INTO Users(fullName, userRole, username, userPassword, pathName, dateAdded, lastEditedDate, lastEditedUser, deleteFlag)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await new Promise((resolve, reject) => {
            db.query(insertSql, [fullName, userRole, username, hashedPassword, pathName, dateAdded, lastEditedDate, lastEditedUser, deleteFlag], (err, result) => {
                if (err) return reject(err);
                console.log("System admin user created with ID:", result.insertId);
                resolve();
            });
        });
    } else {
        console.log("An admin already exists skipping bootstrap.");
    }
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
                console.log('User not found or already deleted.');
                resolve(null);
            }
        });
    });
}

export function getUserByUsername(username){
    return new Promise((resolve, reject) =>{
        const sql = 'SELECT * FROM Users WHERE username = ? AND deleteFlag = 0';
        db.query(sql, [username], (err, results) =>{
            if(err) return reject(err);
            if(results.length > 0){
                console.log("User found: ", results[0]);
                resolve(results[0]);
            }
            else{
                console.log('User not found or already deleted.');
                resolve(null);
            }
        });
    });
}

//UPDATE
export async function updateUserById(userId, updatedObject){
    const hashedPassword = await argon2.hash(updatedObject.userPassword);
    return new Promise((resolve, reject) =>{
        const sql = `
            UPDATE Users
            SET fullName = ?, 
                userRole = ?, 
                username = ?, 
                userPassword = ?,
                pathName = ?,
                lastEditedDate = ?,
                lastEditedUser = ? 
                
            WHERE userId = ?
        `;
        const values = [
            updatedObject.fullName,
            updatedObject.userRole, 
            updatedObject.username, 
            hashedPassword, 
            updatedObject.pathName,
            updatedObject.lastEditedDate,
            updatedObject.lastEditedUser,
            
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
export function deleteUserById(userId){
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
                console.log(`Nothing deleted: `, result);
                resolve(false);
            }
        });
    });
}

const userCascadeMap = {
    Product: {
        where: 'lastEditedUser = ?',
        values: (userId) => [userId]
    },
    StockEntry: {
        where: 'receivedBy = ? OR lastEditedUser = ?',
        values: (userId) => [userId, userId],
        cascade: {
            StockWithdrawal: {
                where: 'entryId IN (SELECT entryId FROM StockEntry WHERE receivedBy = ? OR lastEditedUser = ?)',
                values: (userId) => [userId, userId]
            }
        }
    },
    StockWithdrawal: {
        where: 'withdrawnBy = ? OR authorizedBy = ? OR lastEditedUser = ?',
        values: (userId) => [userId, userId, userId]
    },
    Orders: {
        where: 'handledBy = ? OR lastEditedUser = ?',
        values: (userId) => [userId, userId],
        cascade: {
            OrderInfo: {
                where: 'orderId IN (SELECT orderId FROM Orders WHERE handledBy = ? OR lastEditedUser = ?)',
                values: (userId) => [userId, userId]
            }
        }
    },
    OrderInfo: {
        where: 'lastEditedUser = ?',
        values: (userId) => [userId]
    },
    ReturnExchange: {
        where: 'handledBy = ? OR approvedBy = ? OR lastEditedUser = ?',
        values: (userId) => [userId, userId, userId],
        cascade: {
            ReturnExchangeInfo: {
                where: 'transactionId IN (SELECT transactionId FROM ReturnExchange WHERE handledBy = ? OR approvedBy = ? OR lastEditedUser = ?)',
                values: (userId) => [userId, userId, userId]
            }
        }
    },
    ReturnExchangeInfo: {
        where: 'lastEditedUser = ?',
        values: (userId) => [userId]
    }
};

export async function cascadeDeleteUser(userId){
    const deleted = await deleteUserById(userId);
    if(!deleted){
        return false;
    }
    await processCascade(userCascadeMap, userId)
    return true;
}