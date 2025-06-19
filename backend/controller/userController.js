import express from "express";
import * as mysql from "../model/userModel.js";

const router = express.Router();

router.post("/createUser", async(req, res) =>{
    try{
        const {fullName, userRole, username, userPassword} = req.body;
        const dateAdded = new Date().toISOString().split("T")[0]
        const id = await mysql.createUser(fullName, userRole, username, userPassword, dateAdded, "active");
        res.json({message: "User created successfully!", id});
    }catch(err){
        res.status(500).json({ message: "Error creating User" });
    }
}); //test: curl -X POST http://localhost:5000/api/createUser -H "Content-Type: application/json" -d "{\"fullName\":\"Jane Doe\",\"userRole\":\"admin\",\"username\":\"janedoe\",\"userPassword\":\"secret123\"}"

export default router;