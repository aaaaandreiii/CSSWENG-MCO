import express from "express";
import * as returnExchange from "../model/returnExchangeModel.js";
import * as returnExchangeInfo from "../model/returnExchangeInfoModel.js";

const router = express.Router();

router.post("/createReturnExchange", async(req, res) =>{
    try{
        const {transactionStatus, orderId, handledBy, approvedBy, transactions} = req.body;  
        const dateTransaction = new Date().toISOString().split("T")[0];  
        const transactionId = await returnExchange.createReturnExchange(dateTransaction, transactionStatus, orderId, handledBy, approvedBy);
        for(const transaction of transactions){
            const exchangeProductId = transaction.exchangeProductId ?? null;
            const exchangeQuantity = transaction.exchangeQuantity ?? null;
            await returnExchangeInfo.createReturnExchangeInfo(transaction.returnedProductId, transaction.returnedQuantity, exchangeProductId, exchangeQuantity, transaction.reason, transactionId);
        }
        res.json({message: "Return Exchange and Return Exchange Info created successfully!", transactionId});
    }catch(err){
        console.error("Return Exchange Error:", err);
        res.status(500).json({ message: "Error creating Return Exchange and Return Exchange Info" });
    }
}); //test: curl -X POST http://localhost:5000/api/createReturnExchange -H "Content-Type: application/json" -d "{\"transactionStatus\":\"refunded\",\"orderId\":1,\"handledBy\":1,\"approvedBy\":1,\"transactions\":[{\"returnedProductId\":1,\"returnedQuantity\":1,\"exchangeProductId\":1,\"exchangeQuantity\":1,\"reason\":\"damaged\"},{\"returnedProductId\":2,\"returnedQuantity\":1,\"exchangeProductId\":null,\"exchangeQuantity\":null,\"reason\":\"damaged\"}]}"

export default router;