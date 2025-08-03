import express from "express";
import * as ordersModel from "../model/ordersModel.js";
import * as ordersMergeModel from "../model/ordersMergeModel.js"
import * as orderInfoModel from "../model/orderInfoModel.js";
import { authenJWT } from "../middleware/authenJWT.js";
import { authorizePermission } from "../middleware/authoPerms.js";
import { logAudit } from "../model/auditModel.js";

const router = express.Router();

//Merged orders and orderInfo:
router.post("/createOrder", authenJWT, authorizePermission("edit_order"), async(req, res) =>{
    try{
        const {discount, customer, handledBy, paymentMethod, paymentStatus, items} = req.body;  
        const dateOrdered = new Date().toISOString().split("T")[0];
        const lastEditedDate = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        const lastEditedUser = req.user.userId;
        const orderId = await ordersModel.createOrder(discount, customer, handledBy, paymentMethod, paymentStatus, lastEditedDate, lastEditedUser, dateOrdered, 0);
        for(const item of items){
            await orderInfoModel.createOrderInfo(item.quantity, orderId, item.productId, item.unitPriceAtPurchase, lastEditedDate, lastEditedUser, 0);
        }
        await logAudit("add_order", `Created order ID ${orderId})`, req.user.userId);
        res.json({message: "Orders and Order Info created successfully!", id: orderId});
    }catch(err){
        res.status(500).json({ message: "Error creating Orders and Order Info" });
    }
}); //test: curl -X POST http://localhost:5000/api/createOrder -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN_HERE" -d "{\"discount\":0.10,\"customer\":\"John Doe\",\"handledBy\":1,\"items\":[{\"quantity\":2,\"productId\":1},{\"quantity\":1, \"productId\":2}]}"

router.post("/createOrderInfo", authenJWT, authorizePermission("edit_order"), async(req, res) =>{
    try{
        const {quantity, orderId, productId, unitPriceAtPurchase} = req.body;  
        const lastEditedDate = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        const lastEditedUser = req.user.userId;
        const orderInfoId = await orderInfoModel.createOrderInfo(quantity, orderId, productId, unitPriceAtPurchase, lastEditedDate, lastEditedUser, 0);
        await logAudit("add_order", `Created orderInfo ID ${orderInfoId} for order ${orderId})`, req.user.userId);
        res.json({message: "Order Info created successfully!", id: orderInfoId});
    }catch(err){
        res.status(500).json({ message: "Error creating Order Info" });
    }
});

router.get("/getOrders", authenJWT, authorizePermission("edit_order"), async(req, res) =>{
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
}); //test: curl -X GET http://localhost:5000/api/getOrders -H "Authorization: Bearer TOKEN_HERE"

router.get("/getMergeOrders", authenJWT, authorizePermission("edit_order"), async(req, res) =>{
    try{
        const orders = await ordersMergeModel.getMergeOrders();
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
});

router.get("/getOrderInfo", authenJWT, authorizePermission("edit_order"), async(req, res) =>{
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
}); //test: curl -X GET http://localhost:5000/api/getOrderInfo -H "Authorization: Bearer TOKEN_HERE"

router.get("/getOrderById/:id", authenJWT, authorizePermission("edit_order"), async(req, res) =>{
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
}); //test: curl -X GET http://localhost:5000/api/getOrderById/1 -H "Authorization: Bearer TOKEN_HERE"

// Example route: /checkProductInOrder/:orderId/:productId

// router.get("/checkProductInOrder/:orderId/:productId", authenJWT, authorizePermission("edit_order"), async (req, res) => {
// 	try {
// 		const orderId = parseInt(req.params.orderId);
// 		const productId = parseInt(req.params.productId);

// 		const exists = await orderInfoModel.productExistsInOrder(orderId, productId);
// 		if (exists) {
// 			res.json({ message: "Product exists in order", exists: true });
// 		} else {
// 			res.status(404).json({ message: "Product not found in order", exists: false });
// 		}
// 	} catch (err) {
// 		console.error("Error checking product in order:", err);
// 		res.status(500).json({ message: "Internal server error" });
// 	}
// });

// router.get("/getOrderIdByTransaction/:transactionId", authenJWT, async (req, res) => {
// 	try {
// 		const transactionId = req.params.transactionId;
// 		const [[row]] = await db.query(`
// 			SELECT orderId FROM ReturnExchange WHERE transactionId = ? AND deleteFlag = 0
// 		`, [transactionId]);

// 		if (!row) return res.status(404).send("Transaction not found");
// 		res.json(row); // { orderId: 5 }
// 	} catch (err) {
// 		console.error(err);
// 		res.status(500).send("Server error");
// 	}
// });


router.get("/getOrderInfoById/:id", authenJWT, authorizePermission("edit_order"), async(req, res) =>{
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
}); //test: curl -X GET http://localhost:5000/api/getOrderInfoById/1 -H "Authorization: Bearer TOKEN_HERE"

router.put("/updateOrder/:id", authenJWT, authorizePermission("edit_order"), async(req, res) =>{
    try{
        const orderId = parseInt(req.params.id);
        const updatedData = req.body;
        const lastEditedDate = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        const lastEditedUser = req.user.userId;
        updatedData.lastEditedDate = lastEditedDate;
        updatedData.lastEditedUser = lastEditedUser;
        const result = await ordersModel.updateOrderById(orderId, updatedData);
        if(result){
            await logAudit("edit_order", `Updated order ID ${orderId})`, req.user.userId);
            res.json({ message: "Order updated successfully!", id: orderId });
        }
        else{
            res.status(404).json({ message: "Order not found or not updated" });
        }
    }catch(err){
        res.status(500).json({ message: "Error updating Order" });
    }
}); //test: curl -X PUT http://localhost:5000/api/updateOrder/1 -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN_HERE" -d "{\"discount\":0.15,\"customer\":\"Updated\",\"handledBy\":1}"

router.put("/updateOrderInfo/:id", authenJWT, authorizePermission("edit_order"), async(req, res) =>{
    try{
        const orderInfoId = parseInt(req.params.id);
        const updatedData = req.body;
        const lastEditedDate = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        const lastEditedUser = req.user.userId;
        updatedData.lastEditedDate = lastEditedDate;
        updatedData.lastEditedUser = lastEditedUser;
        const result = await orderInfoModel.updateOrderInfoById(orderInfoId, updatedData);
        if(result){
            await logAudit("edit_orderInfo", `Updated order info ID ${orderInfoId})`, req.user.userId);
            res.json({ message: "Order Info updated successfully!", id: orderInfoId });
        }
        else{
            res.status(404).json({ message: "Order Info not found or not updated" });
        }
    }catch(err){
        res.status(500).json({ message: "Error updating Order Info" });
    }
}); //test: curl -X PUT http://localhost:5000/api/updateOrderInfo/1 -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN_HERE" -d "{\"quantity\":3,\"productId\":2}"

router.put("/updateMergedOrder/:orderInfoId/:orderId", authenJWT, authorizePermission("edit_order"), async (req, res) => {
    try {
        const orderInfoId = parseInt(req.params.orderInfoId);
        const orderId = parseInt(req.params.orderId);
        const updatedData = req.body;

        const lastEditedDate = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");
        const lastEditedUser = req.user.userId;

        updatedData.lastEditedDate = lastEditedDate;
        updatedData.lastEditedUser = lastEditedUser;

        const infoResult = await orderInfoModel.updateOrderInfoById(orderInfoId, updatedData);
        const parentResult = await ordersModel.updateOrderById(orderId, updatedData);

        if (infoResult || parentResult) {
            await logAudit("edit_order", `Updated order ID ${orderId}`, req.user.userId);
            res.json({
                message: "Order and order Info updated successfully",
                orderInfoId, orderId: orderId
            });
        } else {
            res.status(404).json({ message: "Nothing was updated." });
        }
    } catch (err) {
        console.error("Error updating merged order:", err);
        res.status(500).json({ message: "Error updating merged order." });
    }
});

router.delete("/deleteOrder/:id", authenJWT, authorizePermission("edit_order"), async(req, res) =>{
    try{
        const orderId = parseInt(req.params.id);
        const deleted = await ordersModel.cascadeDeleteOrder(orderId);
        if(deleted){
            await logAudit("delete_order", `Deleted order ID ${orderId})`, req.user.userId);
            res.json({ message: "Order deleted successfully!", id: orderId });
        }
        else{
            res.status(404).json({ message: "Order not found or not deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error deleting Order" });
    }
}); //test: curl -X DELETE http://localhost:5000/api/deleteOrder/1 -H "Authorization: Bearer TOKEN_HERE"

router.delete("/deleteOrderInfo/:id", authenJWT, authorizePermission("edit_order"), async(req, res) =>{
    try{
        const orderInfoId = parseInt(req.params.id);
        const deleted = await orderInfoModel.deleteOrderInfoById(orderInfoId);
        if(deleted){
            await logAudit("delete_orderInfo", `Deleted order info ID ${orderInfoId})`, req.user.userId);
            res.json({ message: "Order Info deleted successfully!", id: orderInfoId });
        }
        else{
            res.status(404).json({ message: "Order Info not found or not deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error deleting Order Info" });
    }
}); //test: curl -X DELETE http://localhost:5000/api/deleteOrderInfo/1 -H "Authorization: Bearer TOKEN_HERE"

// GET /api/getFullOrderDetails
router.get("/getFullOrderDetails", authenJWT, authorizePermission("edit_order"), async (req, res) => {
  try {
    const data = await ordersModel.getFullOrderDetails(); 
    res.json({ message: "Full order details fetched!", data });
  } catch (err) {
    console.error("Error fetching full order details:", err);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
});

// DELETE /api/deleteOrder/:orderId
router.delete(
  "/deleteOrder/:orderId",
  authenJWT,
  authorizePermission("edit_order"),
  async (req, res) => {
    try {
      const { orderId } = req.params;
      
      if (!orderId || isNaN(orderId)) {
        return res.status(400).json({ error: "Invalid order ID" });
      }

      const success = await ordersModel.deleteOrder(orderId);
      
      if (!success) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json({ message: "Order deleted successfully" });
    } catch (err) {
      console.error("Error deleting order:", err);
      res.status(500).json({ error: "Failed to delete order" });
    }
  }
);

// DELETE /api/deleteOrderItem/:orderInfoId
router.delete(
  "/deleteOrderItem/:orderInfoId",
  authenJWT,
  authorizePermission("edit_order"),
  async (req, res) => {
    try {
      const { orderInfoId } = req.params;
      
      if (!orderInfoId || isNaN(orderInfoId)) {
        return res.status(400).json({ error: "Invalid order item ID" });
      }

      const success = await orderInfoModel.deleteOrderInfoById(parseInt(orderInfoId));
      
      if (!success) {
        return res.status(404).json({ error: "Order item not found" });
      }

      res.json({ message: "Order item deleted successfully" });
    } catch (err) {
      console.error("Error deleting order item:", err);
      res.status(500).json({ error: "Failed to delete order item" });
    }
  }
);

export default router;