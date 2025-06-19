import express from "express";
import * as mysql from "../model/stockWithdrawalModel.js";

const router = express.Router();

router.post("/createStockWithdrawal", async(req, res) =>{
    try{
        const {quantityWithdrawn, purpose, entryId, withdrawnBy, authorizedBy} = req.body;
        const dateWithdrawn = new Date().toISOString().split("T")[0];
        const id = await mysql.createStockWithdrawal(dateWithdrawn, quantityWithdrawn, purpose, entryId, withdrawnBy, authorizedBy, 1);
        res.json({message: "Stock Withdrawal created successfully!", id});
    }catch(err){
        res.status(500).json({ message: "Error creating Stock Withdrawal" });
    }
}); //test: curl -X POST http://localhost:5000/api/createStockWithdrawal -H "Content-Type: application/json" -d "{\"quantityWithdrawn\":3,\"purpose\":\"damaged\",\"entryId\":1,\"withdrawnBy\":1,\"authorizedBy\":1}"

export default router;