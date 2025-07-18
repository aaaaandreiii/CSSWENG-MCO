import express from "express";
import * as mysql from "../model/stockEntryModel.js";
import { authenJWT } from "../middleware/authenJWT.js";
import { authorizePermission } from "../middleware/authoPerms.js";
import { logAudit } from "../model/auditModel.js";

const router = express.Router();

router.post("/createStockEntry", authenJWT, authorizePermission("edit_stock"), async(req, res) =>{
    try{
        const {branchName, quantityReceived, deliveryReceiptNumber, receivedBy, productId} = req.body;
        const dateReceived = new Date().toISOString().split("T")[0];
        const lastEditedDate = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        const lastEditedUser = req.user.userId;
        const entryId = await mysql.createStockEntry(branchName, dateReceived, quantityReceived, deliveryReceiptNumber, receivedBy, productId, lastEditedDate, lastEditedUser, 0);
        await logAudit("add_stock", `Added stock entry ID ${entryId} for product ${productId}`, req.user.userId);
        res.json({message: "Stock Entry created successfully!", id: entryId});
    }catch(err){
        res.status(500).json({ message: "Error creating Stock Entry" });
    }
}); //test: curl -X POST http://localhost:5000/api/createStockEntry -H "Content-Type: application/json" -d "{\"branchName\":\"Main Branch\",\"quantityReceived\":50,\"deliveryReceiptNumber\":\"2\",\"receivedBy\":1,\"productId\":1}"
//test: curl -X POST http://localhost:5000/api/createStockEntry -H "Content-Type: application/json" -d "{\"branchName\":\"Main Branch\",\"quantityReceived\":50,\"deliveryReceiptNumber\":\"1\",\"receivedBy\":1,\"productId\":2}"

router.get("/getStockEntries", authenJWT, authorizePermission("edit_stock"), async(req, res) =>{
    try{
        const stockEntries = await mysql.getStockEntries();
        if(stockEntries){
            // console.log("Stock Entries fetched: ", stockEntries);
            res.json({message: "Stock Entries found!", stockEntries});
        }
        else{
            res.status(404).json({ message: "Stock Entries not found or already deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error fetching Stock Entries" });
    }
}); //test: curl -X GET http://localhost:5000/api/getStockEntries

router.get("/getStockEntryById/:id", authenJWT, authorizePermission("edit_stock"), async(req, res) =>{
    try{
        const entryId = parseInt(req.params.id);
        const stockEntry = await mysql.getStockEntryById(entryId);
        if(stockEntry){
            // console.log("Stock Entry fetched: ", stockEntry);
            res.json({message: "Stock Entry found!", stockEntry});
        }
        else{
            res.status(404).json({ message: "Stock Entry not found or already deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error fetching Stock Entry" });
    }
}); //test: curl -X GET http://localhost:5000/api/getStockEntryById/1

router.put("/updateStockEntry/:id", authenJWT, authorizePermission("edit_stock"), async(req, res) =>{
    try{
        const entryId = parseInt(req.params.id);
        const updatedData = req.body;
        const lastEditedDate = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        const lastEditedUser = req.user.userId;
        updatedData.lastEditedDate = lastEditedDate;
        updatedData.lastEditedUser = lastEditedUser;
        const result = await mysql.updateStockEntryById(entryId, updatedData);
        if(result){
            await logAudit("edit_stock", `Edited stock entry ID ${entryId}`, req.user.userId);
            res.json({ message: "Stock Entry updated successfully!", id: entryId });
        }
        else{
            res.status(404).json({ message: "Stock Entry not found or not updated" });
        }
    }catch(err){
        res.status(500).json({ message: "Error updating Stock Entry" });
    }
}); //test: Appened -H "Authorization: Bearer TOKEN_HERE" at the end of the header

router.delete("/deleteStockEntry/:id", authenJWT, authorizePermission("edit_stock"), async(req, res) =>{
    try{
        const entryId = parseInt(req.params.id);
        const deleted = await mysql.cascadeDeleteStockEntry(entryId);
        if(deleted){
            await logAudit("delete_stock", `Deleted stock entry ID ${entryId}`, req.user.userId);
            res.json({ message: "Stock Entry deleted successfully!", id: entryId });
        }
        else{
            res.status(404).json({ message: "Stock Entry not found or not deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error deleting Stock Entry" });
    }
}); //test: curl -X DELETE http://localhost:5000/api/deleteStockEntry/1

export default router;