import db from "./db.js"
import argon2 from 'argon2';

//CREATE
export async function createUser(fullName, userRole, username, userPassword, dateAdded, userStatus) {
    const sql = `INSERT INTO Users (fullName, userRole, username, userPassword, dateAdded, userStatus) VALUES (?, ?, ?, ?, ?, ?)`;
    // console.log("Creating user with:");
    // console.log("  Username:", username);
    // console.log("  Plain password:", userPassword);
    // PASSWORD GOT HASHED FROM userController
    
    const result = await new Promise((resolve, reject) => {
        db.query(
            sql,
            [fullName, userRole, username, userPassword, dateAdded, userStatus],
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
    });

    console.log("User created with ID:", result.insertId);
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

export function getUserByUsername(username) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM Users WHERE username = ?';
        db.query(sql, [username], (err, results) => {
            if (err) return reject(err);
            if (results.length > 0) {
                resolve(results[0]); // return single user object
            } else {
                resolve(null); // no match found
            }
        });
    });
}

//UPDATE

//DELETE