import express from "express";
import * as ordersModel from "../model/ordersModel.js";
import * as orderInfoModel from "../model/orderInfoModel.js";

const router = express.Router();

//Merged orders and orderInfo:
router.post("/createOrder", async(req, res) =>{
    try{
        const {discount, customer, handledBy, items} = req.body;  
        const dateOrdered = new Date().toISOString().split("T")[0];  
        const orderId = await ordersModel.createOrder(discount, customer, handledBy, dateOrdered, 0);
        for(const item of items){
            await orderInfoModel.createOrderInfo(item.quantity, orderId, item.productId, 0);
        }
        res.json({message: "Orders and Order Info created successfully!", id: orderId});
    }catch(err){
        res.status(500).json({ message: "Error creating Orders and Order Info" });
    }
}); //test: curl -X POST http://localhost:5000/api/createOrder -H "Content-Type: application/json" -d "{\"discount\":0.10,\"customer\":\"John Doe\",\"handledBy\":1,\"items\":[{\"quantity\":2,\"productId\":1},{\"quantity\":1, \"productId\":2}]}"

router.get("/getOrders", async(req, res) =>{
    try{
        const orders = await ordersModel.getOrders();
        if(orders){
            // console.log("Orders fetched: ", orders);
            res.json({message: "Orders found!", orders});
        }
        else{
            res.status(404).json({ message: "Orders not found or already deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error fetching Orders" });
    }
}); //test: curl -X GET http://localhost:5000/api/getOrders

router.get("/getOrderInfo", async(req, res) =>{
    try{
        const orderInfo = await orderInfoModel.getOrderInfo();
        if(orderInfo){
            // console.log("Order Info fetched: ", orderInfo);
            res.json({message: "Order Info found!", orderInfo});
        }
        else{
            res.status(404).json({ message: "Order Info not found or already deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error fetching Order Info" });
    }
}); //test: curl -X GET http://localhost:5000/api/getOrderInfo

router.get("/getOrderById/:id", async(req, res) =>{
    try{
        const orderId = parseInt(req.params.id);
        const order = await ordersModel.getOrderById(orderId);
        if(order){
            // console.log("Order fetched: ", order);
            res.json({message: "Order found!", order});
        }
        else{
            res.status(404).json({ message: "Order not found or already deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error fetching Order" });
    }
}); //test: curl -X GET http://localhost:5000/api/getOrderById/1

router.get("/getOrderInfoById/:id", async(req, res) =>{
    try{
        const orderInfoId = parseInt(req.params.id);
        const orderInfo = await orderInfoModel.getOrderInfoById(orderInfoId);
        if(orderInfo){
            // console.log("Order Info fetched: ", orderInfo);
            res.json({message: "Order Info found!", orderInfo});
        }
        else{
            res.status(404).json({ message: "Order Info not found or already deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error fetching Order Info" });
    }
}); //test: curl -X GET http://localhost:5000/api/getOrderInfoById/1

router.put("/updateOrder/:id", async(req, res) =>{
    try{
        const orderId = parseInt(req.params.id);
        const updatedData = req.body;
        const result = await ordersModel.updateOrderById(orderId, updatedData);
        if(result){
            res.json({ message: "Order updated successfully!", id: orderId });
        }
        else{
            res.status(404).json({ message: "Order not found or not updated" });
        }
    }catch(err){
        res.status(500).json({ message: "Error updating Order" });
    }
}); //test: 

router.put("/updateOrderInfo/:id", async(req, res) =>{
    try{
        const orderInfoId = parseInt(req.params.id);
        const updatedData = req.body;
        const result = await orderInfoModel.updateOrderInfoById(orderInfoId, updatedData);
        if(result){
            res.json({ message: "Order Info updated successfully!", id: orderInfoId });
        }
        else{
            res.status(404).json({ message: "Order Info not found or not updated" });
        }
    }catch(err){
        res.status(500).json({ message: "Error updating Order Info" });
    }
}); //test: 

router.delete("/deleteOrder/:id", async(req, res) =>{
    try{
        const orderId = parseInt(req.params.id);
        const deleted = await ordersModel.cascadeDeleteOrder(orderId);
        if(deleted){
            res.json({ message: "Order deleted successfully!", id: orderId });
        }
        else{
            res.status(404).json({ message: "Order not found or not deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error deleting Order" });
    }
}); //test: curl -X DELETE http://localhost:5000/api/deleteOrder/1

router.delete("/deleteOrderInfo/:id", async(req, res) =>{
    try{
        const orderInfoId = parseInt(req.params.id);
        const deleted = await orderInfoModel.deleteOrderInfoById(orderInfoId);
        if(deleted){
            res.json({ message: "Order Info deleted successfully!", id: orderInfoId });
        }
        else{
            res.status(404).json({ message: "Order Info not found or not deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error deleting Order Info" });
    }
}); //test: curl -X DELETE http://localhost:5000/api/deleteOrderInfo/1

export default router;