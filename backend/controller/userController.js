import express from "express";
import * as mysql from "../model/userModel.js";

const router = express.Router();

router.post("/createUser", async(req, res) =>{
    try{
        const {fullName, userRole, username, userPassword} = req.body;
        const dateAdded = new Date().toISOString().split("T")[0]
        const userId = await mysql.createUser(fullName, userRole, username, userPassword, dateAdded, 0);
        res.json({message: "User created successfully!", id: userId});
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Error creating User" });
    }
}); //test: curl -X POST http://localhost:5000/api/createUser -H "Content-Type: application/json" -d "{\"fullName\":\"Jane Doe\",\"userRole\":\"admin\",\"username\":\"janedoe\",\"userPassword\":\"secret123\"}"

router.get("/getUsers", async(req, res) =>{
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
}); //test: curl -X GET http://localhost:5000/api/getUsers

router.get("/getUserById/:id", async(req, res) =>{
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
}); //test: curl -X GET http://localhost:5000/api/getUserById/1

router.put("/updateUser/:id", async(req, res) =>{
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
}); 

router.delete("/deleteUser/:id", async(req, res) =>{
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
}); //test: curl -X DELETE http://localhost:5000/api/deleteUser/1

export default router;