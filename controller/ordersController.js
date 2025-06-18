import express from "express";
import * as ordersModel from "../model/ordersModel.js";
import * as orderInfoModel from "../model/orderInfoModel.js";

const router = express.Router();

//Merged orders and orderInfo:
router.post("/createOrders", async(req, res) =>{
    try{
        const {discount, customer, handledBy, items} = req.body;  
        const dateOrdered = new Date().toISOString().split("T")[0];  
        const orderId = await ordersModel.createOrders(discount, customer, handledBy, dateOrdered);
        for(const item of items){
            await orderInfoModel.createOrderInfo(item.quantity, orderId, item.productId);
        }
        res.json({message: "Orders and Order Info created successfully!", orderId});
    }catch(err){
        res.status(500).json({ message: "Error creating Orders and Order Info" });
    }
}); //test: curl -X POST http://localhost:5000/api/createOrders -H "Content-Type: application/json" -d "{\"discount\":0.10,\"customer\":\"John Doe\",\"handledBy\":1,\"items\":[{\"quantity\":2,\"productId\":1},{\"quantity\":1, \"productId\":2}]}"

export default router;