import express from "express";
import * as mysql from "../model/stockWithdrawalModel.js";

const router = express.Router();

router.post("/createStockWithdrawal", async(req, res) =>{
    try{
        const {quantityWithdrawn, purpose, entryId, withdrawnBy, authorizedBy} = req.body;
        const dateWithdrawn = new Date().toISOString().split("T")[0];
        const withdrawalId = await mysql.createStockWithdrawal(dateWithdrawn, quantityWithdrawn, purpose, entryId, withdrawnBy, authorizedBy, 0);
        res.json({message: "Stock Withdrawal created successfully!", id: withdrawalId});
    }catch(err){
        res.status(500).json({ message: "Error creating Stock Withdrawal" });
    }
}); //test: curl -X POST http://localhost:5000/api/createStockWithdrawal -H "Content-Type: application/json" -d "{\"quantityWithdrawn\":3,\"purpose\":\"damaged\",\"entryId\":1,\"withdrawnBy\":1,\"authorizedBy\":1}"

router.get("/getStockWithdrawals", async(req, res) =>{
    try{
        const stockWithdrawals = await mysql.getStockWithdrawals();
        if(stockWithdrawals){
            // console.log("Stock Withdrawals fetched: ", stockWithdrawals);
            res.json({message: "Stock Withdrawals found!", stockWithdrawals});
        }
        else{
            res.status(404).json({ message: "Stock Withdrawals not found or already deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error fetching Stock Withdrawals" });
    }
}); //test: curl -X GET http://localhost:5000/api/getStockWithdrawals

router.get("/getStockWithdrawalById/:id", async(req, res) =>{
    try{
        const withdrawalId = parseInt(req.params.id);
        const stockWithdrawal = await mysql.getStockWithdrawalById(withdrawalId);
        if(stockWithdrawal){
            // console.log("Stock Withdrawal fetched: ", stockWithdrawal);
            res.json({message: "Stock Withdrawal found!", stockWithdrawal});
        }
        else{
            res.status(404).json({ message: "Stock Withdrawal not found or already deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error fetching Stock Withdrawal" });
    }
}); //test: curl -X GET http://localhost:5000/api/getStockWithdrawalById/1

router.put("/updateStockWithdrawal/:id", async(req, res) =>{
    try{
        const withdrawalId = parseInt(req.params.id);
        const updatedData = req.body;
        const result = await mysql.updateStockWithdrawalById(withdrawalId, updatedData);
        if(result){
            res.json({ message: "Stock Withdrawal updated successfully!", id: withdrawalId });
        }
        else{
            res.status(404).json({ message: "Stock Withdrawal not found or not updated" });
        }
    }catch(err){
        res.status(500).json({ message: "Error updating Stock Withdrawal" });
    }
}); 

router.delete("/deleteStockWithdrawal/:id", async(req, res) =>{
    try{
        const withdrawalId = parseInt(req.params.id);
        const deleted = await mysql.deleteStockWithdrawalById(withdrawalId);
        if(deleted){
            res.json({ message: "Stock Withdrawal deleted successfully!", id: withdrawalId });
        }
        else{
            res.status(404).json({ message: "Stock Withdrawal not found or not deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error deleting Stock Withdrawal" });
    }
}); //test: curl -X DELETE http://localhost:5000/api/deleteStockWithdrawal/1

export default router;