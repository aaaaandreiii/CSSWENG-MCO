import express from "express";
import * as mysql from "../model/userModel.js";
import argon2 from 'argon2';
import jwt from "jsonwebtoken";
import { authenJWT } from "../middleware/authenJWT.js";
import { authorizePermission } from "../middleware/authoPerms.js";
import * as auditModel from "../model/auditModel.js";

const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await mysql.getUserByUsername(username);
        if (!user) {
        return res.status(400).json({ message: "Invalid username or password" });
        }
        console.log("User from DB:", user);

        const isValid = await argon2.verify(user.userPassword, password);
        console.log("isValid:", isValid);

        if (!isValid) {
        return res.status(400).json({ message: "Invalid username or password" });
        }
        
        //Success
        const token = jwt.sign(
        { userId: user.userId, role: user.userRole },
        "secretkey", //move to .env l8r
        { expiresIn: "1h" }
        );

        await logAudit("login", `User ${user.fullName} logged in.`, user.userId);

        console.log("Login success! Sending token...");
        return res.json({ message: "Login successful", token });

        } catch (err) {
            console.error("Login error:", err);
            res.status(500).json({ message: "Internal server error" });
        }
}); //test: curl -X POST http://localhost:5000/api/login   -H "Content-Type: application/json"   -d '{"username":"janedoe","password":"secret123"}'

router.post("/createUser", authenJWT, authorizePermission("manage_users"), async(req, res) =>{
    try{
        const {fullName, userRole, username, userPassword} = req.body;
        const dateAdded = new Date().toISOString().split("T")[0]
        const userId = await mysql.createUser(fullName, userRole, username, userPassword, dateAdded, 0);
        res.json({message: "User created successfully!", id: userId});
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Error creating User" });
    }
}); //test: curl -X POST http://localhost:5000/api/createUser -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN_HERE" -d "{\"fullName\":\"Jane Doe\",\"userRole\":\"admin\",\"username\":\"janedoe\",\"userPassword\":\"secret123\"}"

router.get("/getUsers", authenJWT, authorizePermission("manage_users"), async(req, res) =>{
    try{
        const users = await mysql.getUsers();
        if(users){
            // console.log("Users fetched: ", users);
            res.json({message: "Users found!", users});
        }
        else{
            res.status(404).json({ message: "Users not found or already deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error fetching Users" });
    }
}); //test: curl -X GET http://localhost:5000/api/getUsers -H "Authorization: Bearer TOKEN_HERE"

router.get("/getUserById/:id", authenJWT, authorizePermission("manage_users"), async(req, res) =>{
    try{
        const userId = parseInt(req.params.id);
        const user = await mysql.getUserById(userId);
        if(user){
            // console.log("User fetched: ", user);
            res.json({message: "User found!", user});
        }
        else{
            res.status(404).json({ message: "User not found or already deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error fetching User" });
    }
}); //test: curl -X GET http://localhost:5000/api/getUserById/1 -H "Authorization: Bearer TOKEN_HERE"

router.get("/getUserByUsername/:username", authenJWT, authorizePermission("manage_users"), async(req, res) =>{
    try{
        const username = req.params.username;
        const user = await mysql.getUserByUsername(username);
        if(user){
            // console.log("User fetched: ", user);
            res.json({message: "User found!", user});
        }
        else{
            res.status(404).json({ message: "User not found or already deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error fetching User" });
    }
}); //test: curl -X GET http://localhost:5000/api/getUserByUsername/janedoe -H "Authorization: Bearer TOKEN_HERE"

router.put("/updateUser/:id", authenJWT, authorizePermission("manage_users"), async(req, res) =>{
    try{
        const userId = parseInt(req.params.id);
        const updatedData = req.body;
        const result = await mysql.updateUserById(userId, updatedData);
        if(result){
            res.json({ message: "User updated successfully!", id: userId });
        }
        else{
            res.status(404).json({ message: "User not found or not updated" });
        }
    }catch(err){
        res.status(500).json({ message: "Error updating User" });
    }
}); //test: curl -X PUT http://localhost:5000/api/updateUser/1 -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN_HERE" -d "{\"fullName\":\"Janet D.\",\"userRole\":\"manager\",\"username\":\"janetdoe\",\"userPassword\":\"secure456\"}"

router.delete("/deleteUser/:id", authenJWT, authorizePermission("manage_users"), async(req, res) =>{
    try{
        const userId = parseInt(req.params.id);
        const deleted = await mysql.cascadeDeleteUser(userId);
        if(deleted){
            res.json({ message: "User deleted successfully!", id: userId });
        }
        else{
            res.status(404).json({ message: "User not found or not deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error deleting User" });
    }
}); //test: curl -X DELETE http://localhost:5000/api/deleteUser/1 -H "Authorization: Bearer TOKEN_HERE"

export async function getAllAuditLogs(req, res) {
    try {
        const logs = await auditModel.getAllAuditLogs();
        res.json({ message: "Audit logs fetched successfully!", logs });
    } catch (err) {
        console.error("Error fetching audit logs:", err);
        res.status(500).json({ message: "Failed to fetch audit logs." });
    }
}//test: curl -X GET http://localhost:5000/api/auditLogs -H "Authorization: Bearer TOKEN_HERE"

export async function getAuditLogsByUser(req, res) {
    try {
        const userId = parseInt(req.params.userId);
        const logs = await auditModel.getAuditLogsByUser(userId);
        res.json({ message: `Audit logs for user ${userId} fetched successfully!`, logs });
    } catch (err) {
        console.error("Error fetching audit logs for user:", err);
        res.status(500).json({ message: "Failed to fetch audit logs for user." });
    }
}//test: curl -X GET http://localhost:5000/api/auditLogs/1 -H "Authorization: Bearer TOKEN_HERE"

export default router;