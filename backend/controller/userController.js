import express from "express";
import * as mysql from "../model/userModel.js";
import argon2 from 'argon2';
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/createUser", async(req, res) =>{
    try{
        const {fullName, userRole, username, userPassword} = req.body;
        const dateAdded = new Date().toISOString().split("T")[0]
        const hashedPassword = await argon2.hash(userPassword);
        const id = await mysql.createUser(fullName, userRole, username, hashedPassword, dateAdded, "active");
        res.json({message: "User created successfully!", id});
    }catch(err){
        console.error("Error creating user:", err);  // <--- add this line
        res.status(500).json({ message: "Error creating User" });
    }
}); //test: curl -X POST http://localhost:5000/api/createUser -H "Content-Type: application/json" -d "{\"fullName\":\"Jane Doe\",\"userRole\":\"admin\",\"username\":\"janedoe\",\"userPassword\":\"secret123\"}"



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

        console.log("Login success! Sending token...");
        return res.json({ message: "Login successful", token });

        } catch (err) {
            console.error("Login error:", err);
            res.status(500).json({ message: "Internal server error" });
        }
}); //test: curl -X POST http://localhost:5000/api/login   -H "Content-Type: application/json"   -d '{"username":"janedoe","password":"secret123"}'


export default router;