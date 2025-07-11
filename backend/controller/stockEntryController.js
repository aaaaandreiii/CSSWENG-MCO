import express from "express";
import * as mysql from "../model/stockEntryModel.js";

const router = express.Router();

router.post("/createStockEntry", async(req, res) =>{
    try{
        const {branchName, quantityReceived, deliveryReceiptNumber, receivedBy, productId} = req.body;
        const dateReceived = new Date().toISOString().split("T")[0];
        const entryId = await mysql.createStockEntry(branchName, dateReceived, quantityReceived, deliveryReceiptNumber, receivedBy, productId, 0);
        res.json({message: "Stock Entry created successfully!", id: entryId});
    }catch(err){
        res.status(500).json({ message: "Error creating Stock Entry" });
    }
}); //test: curl -X POST http://localhost:5000/api/createStockEntry -H "Content-Type: application/json" -d "{\"branchName\":\"Main Branch\",\"quantityReceived\":50,\"deliveryReceiptNumber\":\"2\",\"receivedBy\":1,\"productId\":1}"
//test: curl -X POST http://localhost:5000/api/createStockEntry -H "Content-Type: application/json" -d "{\"branchName\":\"Main Branch\",\"quantityReceived\":50,\"deliveryReceiptNumber\":\"1\",\"receivedBy\":1,\"productId\":2}"

router.get("/getStockEntries", async(req, res) =>{
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

router.get("/getStockEntryById/:id", async(req, res) =>{
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

router.put("/updateStockEntry/:id", async(req, res) =>{
    try{
        const entryId = parseInt(req.params.id);
        const updatedData = req.body;
        const result = await mysql.updateStockEntryById(entryId, updatedData);
        if(result){
            res.json({ message: "Stock Entry updated successfully!", id: entryId });
        }
        else{
            res.status(404).json({ message: "Stock Entry not found or not updated" });
        }
    }catch(err){
        res.status(500).json({ message: "Error updating Stock Entry" });
    }
}); 

router.delete("/deleteStockEntry/:id", async(req, res) =>{
    try{
        const entryId = parseInt(req.params.id);
        const deleted = await mysql.cascadeDeleteStockEntry(entryId);
        if(deleted){
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