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
        const sql = 'SELECT * FROM Users';
        db.query(sql, (err, results) =>{
            if(err) return reject(err);
            console.log("Users: ", results);
            resolve (results);
        });
    });
}

export function getUserById(userId){
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

//UPDATE

//DELETE