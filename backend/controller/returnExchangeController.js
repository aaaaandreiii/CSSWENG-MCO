import express from "express";
import * as returnExchangeModel from "../model/returnExchangeModel.js";
import * as returnExchangeInfoModel from "../model/returnExchangeInfoModel.js";

const router = express.Router();

router.post("/createReturnExchange", async(req, res) =>{
    try{
        const {transactionStatus, orderId, handledBy, approvedBy, transactions} = req.body;  
        const dateTransaction = new Date().toISOString().split("T")[0];  
        const transactionId = await returnExchangeModel.createReturnExchange(dateTransaction, transactionStatus, orderId, handledBy, approvedBy, 0);
        for(const transaction of transactions){
            const exchangeProductId = transaction.exchangeProductId ?? null;
            const exchangeQuantity = transaction.exchangeQuantity ?? null;
            await returnExchangeInfoModel.createReturnExchangeInfo(transaction.returnedProductId, transaction.returnedQuantity, exchangeProductId, exchangeQuantity, transaction.reason, transactionId, 0);
        }
        res.json({message: "Return Exchange and Return Exchange Info created successfully!", id: transactionId});
    }catch(err){
        console.error("Return Exchange Error:", err);
        res.status(500).json({ message: "Error creating Return Exchange and Return Exchange Info" });
    }
}); //test: curl -X POST http://localhost:5000/api/createReturnExchange -H "Content-Type: application/json" -d "{\"transactionStatus\":\"refunded\",\"orderId\":1,\"handledBy\":1,\"approvedBy\":1,\"transactions\":[{\"returnedProductId\":1,\"returnedQuantity\":1,\"exchangeProductId\":1,\"exchangeQuantity\":1,\"reason\":\"damaged\"},{\"returnedProductId\":2,\"returnedQuantity\":1,\"exchangeProductId\":null,\"exchangeQuantity\":null,\"reason\":\"damaged\"}]}"

router.get("/getReturnExchanges", async(req, res) =>{
    try{
        const returnExchanges = await returnExchangeModel.getReturnExchanges();
        if(returnExchanges){
            // console.log("Return Exchanges fetched: ", returnExchanges);
            res.json({message: "Return Exchanges found!", returnExchanges});
        }
        else{
            res.status(404).json({ message: "Return Exchanges not found or already deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error fetching Return Exchanges" });
    }
}); //test: curl -X GET http://localhost:5000/api/getReturnExchanges

router.get("/getReturnExchangeInfo", async(req, res) =>{
    try{
        const returnExchangeInfo = await returnExchangeInfoModel.getReturnExchangeInfo();
        if(returnExchangeInfo){
            // console.log("Return Exchange Info fetched: ", returnExchangeInfo);
            res.json({message: "Return Exchange Info found!", returnExchangeInfo});
        }
        else{
            res.status(404).json({ message: "Return Exchange Info not found or already deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error fetching Return Exchange Info" });
    }
}); //test: curl -X GET http://localhost:5000/api/getReturnExchangeInfo

router.get("/getReturnExchangeById/:id", async(req, res) =>{
    try{
        const transactionId = parseInt(req.params.id);
        const returnExchange = await returnExchangeModel.getReturnExchangeById(transactionId);
        if(returnExchange){
            // console.log("Return Exchange fetched: ", returnExchange);
            res.json({message: "Return Exchange found!", returnExchange});
        }
        else{
            res.status(404).json({ message: "Return Exchange not found or already deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error fetching Return Exchange" });
    }
}); //test: curl -X GET http://localhost:5000/api/getReturnExchangeById/1

router.get("/getReturnExchangeInfoById/:id", async(req, res) =>{
    try{
        const detailId = parseInt(req.params.id);
        const returnExchangeInfo = await returnExchangeInfoModel.getReturnExchangeInfoById(detailId);
        if(returnExchangeInfo){
            // console.log("Return Exchange Info fetched: ", returnExchangeInfo);
            res.json({message: "Return Exchange Info found!", returnExchangeInfo});
        }
        else{
            res.status(404).json({ message: "Return Exchange Info not found or already deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error fetching Return Exchange Info" });
    }
}); //test: curl -X GET http://localhost:5000/api/getReturnExchangeInfoById/1

router.put("/updateReturnExchange/:id", async(req, res) =>{
    try{
        const transactionId = parseInt(req.params.id);
        const updatedData = req.body;
        const result = await returnExchangeModel.updateReturnExchangeById(transactionId, updatedData);
        if(result){
            res.json({ message: "Return Exchange updated successfully!", id: transactionId });
        }
        else{
            res.status(404).json({ message: "Return Exchange not found or not updated" });
        }
    }catch(err){
        res.status(500).json({ message: "Error updating Return Exchange" });
    }
}); //test: 

router.put("/updateReturnExchangeInfo/:id", async(req, res) =>{
    try{
        const detailId = parseInt(req.params.id);
        const updatedData = req.body;
        const result = await returnExchangeInfoModel.updateReturnExchangeInfoById(detailId, updatedData);
        if(result){
            res.json({ message: "Return Exchange Info updated successfully!", id: detailId });
        }
        else{
            res.status(404).json({ message: "Return Exchange Info not found or not updated" });
        }
    }catch(err){
        res.status(500).json({ message: "Error updating Return Exchange Info" });
    }
}); //test: 

router.delete("/deleteReturnExchange/:id", async(req, res) =>{
    try{
        const transactionId = parseInt(req.params.id);
        const deleted = await returnExchangeModel.cascadeDeleteReturnExchange(transactionId);
        if(deleted){
            res.json({ message: "Return Exchange deleted successfully!", id: transactionId });
        }
        else{
            res.status(404).json({ message: "Return Exchange not found or not deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error deleting Return Exchange" });
    }
}); //test: curl -X DELETE http://localhost:5000/api/deleteReturnExchange/1

router.delete("/deleteReturnExchangeInfo/:id", async(req, res) =>{
    try{
        const detailId = parseInt(req.params.id);
        const deleted = await returnExchangeInfoModel.deleteReturnExchangeInfo(detailId);
        if(deleted){
            res.json({ message: "Return Exchange Info deleted successfully!", id: detailId });
        }
        else{
            res.status(404).json({ message: "Return Exchange Info not found or not deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error deleting Return Exchange Info" });
    }
}); //test: curl -X DELETE http://localhost:5000/api/deleteReturnExchangeInfo/1

export default router;