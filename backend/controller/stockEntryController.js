import express from "express";
import * as mysql from "../model/stockEntryModel.js";

const router = express.Router();

router.post("/createStockEntry", async(req, res) =>{
    try{
        const {branchName, quantityReceived, deliveryReceiptNumber, receivedBy, productId} = req.body;
        const dateReceived = new Date().toISOString().split("T")[0];
        const id = await mysql.createStockEntry(branchName, dateReceived, quantityReceived, deliveryReceiptNumber, receivedBy, productId, 1);
        res.json({message: "Stock Entry created successfully!", id});
    }catch(err){
        res.status(500).json({ message: "Error creating Stock Entry" });
    }
}); //test: curl -X POST http://localhost:5000/api/createStockEntry -H "Content-Type: application/json" -d "{\"branchName\":\"Main Branch\",\"quantityReceived\":50,\"deliveryReceiptNumber\":\"2\",\"receivedBy\":1,\"productId\":1}"
//test: curl -X POST http://localhost:5000/api/createStockEntry -H "Content-Type: application/json" -d "{\"branchName\":\"Main Branch\",\"quantityReceived\":50,\"deliveryReceiptNumber\":\"1\",\"receivedBy\":1,\"productId\":2}"

export default router;