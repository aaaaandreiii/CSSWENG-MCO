import express from "express";
import * as mysql from "../model/stockWithdrawalModel.js";
import { authenJWT } from "../middleware/authenJWT.js";
import { authorizePermission } from "../middleware/authoPerms.js";
import { logAudit } from "../model/auditModel.js";

const router = express.Router();

router.post("/createStockWithdrawal", authenJWT, authorizePermission("edit_stock"), async(req, res) =>{
    try{
        const {quantityWithdrawn, purpose, entryId, withdrawnBy, authorizedBy} = req.body;
        const dateWithdrawn = new Date().toISOString().split("T")[0];
        const lastEditedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const lastEditedUser = req.user.userId;
        const withdrawalId = await mysql.createStockWithdrawal(dateWithdrawn, quantityWithdrawn, purpose, entryId, withdrawnBy, authorizedBy, lastEditedDate, lastEditedUser, 0);
        await logAudit("add_stock", `Created withdrawal ID ${withdrawalId} for entry ${entryId} (Qty: ${quantityWithdrawn})`, req.user.userId);
        res.json({message: "Stock Withdrawal created successfully!", id: withdrawalId});
    }catch(err){
        res.status(500).json({ message: "Error creating Stock Withdrawal" });
    }
}); //test: curl -X POST http://localhost:5000/api/createStockWithdrawal -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN_HERE" -d "{\"quantityWithdrawn\":3,\"purpose\":\"damaged\",\"entryId\":1,\"withdrawnBy\":1,\"authorizedBy\":1}"

router.get("/getStockWithdrawals", authenJWT, authorizePermission("edit_stock"), async(req, res) =>{
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
}); //test: curl -X GET http://localhost:5000/api/getStockWithdrawals -H "Authorization: Bearer TOKEN_HERE"

router.get("/getStockWithdrawalById/:id", authenJWT, authorizePermission("edit_stock"), async(req, res) =>{
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
}); //test: curl -X GET http://localhost:5000/api/getStockWithdrawalById/1 -H "Authorization: Bearer TOKEN_HERE"

router.put("/updateStockWithdrawal/:id", authenJWT, authorizePermission("edit_stock"), async(req, res) =>{
    try{
        const withdrawalId = parseInt(req.params.id);
        const updatedData = req.body;
        const result = await mysql.updateStockWithdrawalById(withdrawalId, updatedData);
        if(result){
            await logAudit("edit_stock", `Updated withdrawal ID ${withdrawalId}`, req.user.userId);
            res.json({ message: "Stock Withdrawal updated successfully!", id: withdrawalId });
        }
        else{
            res.status(404).json({ message: "Stock Withdrawal not found or not updated" });
        }
    }catch(err){
        res.status(500).json({ message: "Error updating Stock Withdrawal" });
    }
});  //test: Appened -H "Authorization: Bearer TOKEN_HERE" at the end of the header

router.delete("/deleteStockWithdrawal/:id", authenJWT, authorizePermission("edit_stock"), async(req, res) =>{
    try{
        const withdrawalId = parseInt(req.params.id);
        const deleted = await mysql.deleteStockWithdrawalById(withdrawalId);
        if(deleted){
            await logAudit("delete_stock", `Deleted withdrawal ID ${withdrawalId}`, req.user.userId);
            res.json({ message: "Stock Withdrawal deleted successfully!", id: withdrawalId });
        }
        else{
            res.status(404).json({ message: "Stock Withdrawal not found or not deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error deleting Stock Withdrawal" });
    }
}); //test: curl -X DELETE http://localhost:5000/api/deleteStockWithdrawal/1 -H "Authorization: Bearer TOKEN_HERE"

export default router;