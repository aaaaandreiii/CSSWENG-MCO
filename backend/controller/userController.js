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
        { userId: user.userId, username: user.username, role: user.userRole },
        "secretkey", //move to .env l8r
        { expiresIn: "1h" }
        );

        await auditModel.logAudit("login", `User ${user.username} logged in.`, user.userId);

        console.log("Login success! Sending token...");
        return res.json({ message: "Login successful", token });

        } catch (err) {
            console.error("Login error:", err);
            res.status(500).json({ message: "Internal server error" });
        }
}); //test: curl -X POST http://localhost:5000/api/login   -H "Content-Type: application/json"   -d '{"username":"janedoe","password":"secret123"}'
//curl -X POST http://localhost:5000/api/login -H "Content-Type: application/json" -d "{\"username\":\"aaa\",\"password\":\"123\"}"
//curl -X POST http://localhost:5000/api/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"123456789\"}" 

//log audit
router.post("/logout", authenJWT, async (req, res) => {
    try {
        const user = req.user;
        await auditModel.logAudit("logout", `User ${user.username} logged out.`, user.userId);
        console.log("Logout success!");
        return res.json({ message: "Logout successful!" });
    }catch(err){
        console.error("Logout error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/logoutExpired", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        console.log("Received token:", token);
        const decoded = jwt.decode(token); 
        console.log("Decoded token:", decoded);
        if(decoded?.userId && decoded?.username){
            await auditModel.logAudit("logout", `Session expired for user ${decoded.username} logged out.`, decoded.userId);
        }
        console.log("Expired logout success!");
        return res.json({ message: "Expired logout successful!" });
    }catch(err){
        console.error("Expired logout error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/createUser", authenJWT, authorizePermission("manage_users"), async(req, res) =>{
    try{
        const {fullName, userRole, username, userPassword, pathName} = req.body;
        const user = req.user;
        const dateAdded = new Date().toISOString().split("T")[0];
        const lastEditedDate = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        const lastEditedUser = req.user.userId;
        const userId = await mysql.createUser(fullName, userRole, username, userPassword, pathName, dateAdded, lastEditedDate, lastEditedUser, 0);
        await auditModel.logAudit("add_user", `User ${user.username} created user ${userId}.`, user.userId);
        res.json({message: "User created successfully!", id: userId});
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Error creating User" });
    }
}); //test: curl -X POST http://localhost:5000/api/createUser -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN_HERE" -d "{\"fullName\":\"Jane Doe\",\"userRole\":\"admin\",\"username\":\"janedoe\",\"userPassword\":\"secret123\"}"

router.get("/getUsers", authenJWT, authorizePermission("view_users"), async(req, res) =>{
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

router.get("/getAllUsers", authenJWT, authorizePermission("view_inventory"), async(req, res) =>{
    try{
        const users = await mysql.getAllUsers();
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
});

router.get("/getUserProfile", authenJWT, async(req, res) =>{
    try{
        const userId = req.user.userId;
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
});

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
        const user = req.user;
        const updatedData = req.body;
        const lastEditedDate = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        const lastEditedUser = req.user.userId;
        updatedData.lastEditedDate = lastEditedDate;
        updatedData.lastEditedUser = lastEditedUser;
        const result = await mysql.updateUserById(userId, updatedData);
        if(result){
            await auditModel.logAudit("edit_user", `User ${user.username} updated user ${userId}.`, user.userId);
            res.json({ message: "User updated successfully!", id: userId });
        }
        else{
            res.status(404).json({ message: "User not found or not updated" });
        }
    }catch(err){
        res.status(500).json({ message: "Error updating User" });
    }
}); //test: curl -X PUT http://localhost:5000/api/updateUser/1 -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN_HERE" -d "{\"fullName\":\"Janet D.\",\"userRole\":\"manager\",\"username\":\"janetdoe\",\"userPassword\":\"secure456\"}"

router.put("/updateProfile", authenJWT, async(req, res) =>{
    try{
        const user = req.user;
        const userId = req.user.userId;
        const updatedData = req.body;
        const lastEditedDate = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        const lastEditedUser = req.user.userId;
        updatedData.lastEditedDate = lastEditedDate;
        updatedData.lastEditedUser = lastEditedUser;
        const result = await mysql.updateUserById(userId, updatedData);
        if(result){
            await auditModel.logAudit("edit_user", `User ${user.username} updated profile.`, user.userId);
            res.json({ message: "Profile updated successfully!", id: userId });
        }
        else{
            res.status(404).json({ message: "Profile not found or not updated" });
        }
    }catch(err){
        res.status(500).json({ message: "Error updating Profile" });
    }
});

router.delete("/deleteUser/:id", authenJWT, authorizePermission("manage_users"), async(req, res) =>{
    try{
        const userId = parseInt(req.params.id);
        const user = req.user;
        const deleted = await mysql.cascadeDeleteUser(userId);
        if(deleted){
            await auditModel.logAudit("delete_user", `User ${user.username} deleted user ${userId}.`, user.userId);
            res.json({ message: "User deleted successfully!", id: userId });
        }
        else{
            res.status(404).json({ message: "User not found or not deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error deleting User" });
    }
}); //test: curl -X DELETE http://localhost:5000/api/deleteUser/1 -H "Authorization: Bearer TOKEN_HERE"

export default router;