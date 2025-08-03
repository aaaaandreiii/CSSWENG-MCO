import db from "../model/db.js";
import express from "express";
import * as mysql from "../model/productModel.js";
import { authenJWT } from "../middleware/authenJWT.js";
import { authorizePermission } from "../middleware/authoPerms.js";
import { logAudit } from "../model/auditModel.js";

const router = express.Router();

router.post("/createProduct", authenJWT, authorizePermission("edit_product"), async(req, res) =>{
    try{
        const {productName, category, descriptions, supplier, cost, retailPrice, stockOnHand, units, pathName, safeStockCount, restockFlag} = req.body;
        const lastEditedDate = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        const lastEditedUser = req.user.userId;
        const productId = await mysql.createProduct(productName, category, descriptions, supplier, cost, retailPrice, stockOnHand, units, pathName, safeStockCount, restockFlag, lastEditedDate, lastEditedUser, 0);
        await logAudit("add_product", `Created product ID ${productId})`, req.user.userId);
        res.json({message: "Product created successfully!", id: productId});
        
    }catch(err){
        console.error("❌ Error creating product:", err); 
         await auditModel.logAudit(
            "add_stock",
            `Error occurred while adding a product.`,
            req.user?.userId || null
        );
        res.status(500).json({ message: "Error creating Product" });
    }
}); //test: curl -X POST http://localhost:5000/api/createProduct -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN_HERE" -d "{\"productName\":\"Ping Pong Ball\",\"category\":\"ball\",\"descriptions\":\"descriptionss\",\"supplier\":\"someone\",\"cost\":100,\"retailPrice\":150,\"stockOnHand\":50,\"units\":\"pcs\"}"
// test: curl -X POST http://localhost:5000/api/createProduct -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN_HERE" -d "{\"productName\":\"Ping Pong Pan\",\"category\":\"paddle\",\"descriptions\":\"descriptionss\",\"supplier\":\"someone\",\"cost\":100,\"retailPrice\":150,\"stockOnHand\":50,\"units\":\"pcs\"}"

router.get("/getProducts", authenJWT, authorizePermission("edit_product"), async(req, res) =>{
    try{
        const products = await mysql.getProducts();
        if(products){
            // console.log("Products fetched: ", products);
            res.json({message: "Products found!", products});
        }
        else{
            res.status(404).json({ message: "Products not found or already deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error fetching Products" });
    }
}); //test: curl -X GET http://localhost:5000/api/getProducts -H "Authorization: Bearer TOKEN_HERE"

router.get("/getAllProducts", authenJWT, authorizePermission("edit_product"), async(req, res) =>{
    try{
        const products = await mysql.getAllProducts();
        if(products){
            // console.log("Products fetched: ", products);
            res.json({message: "Products found!", products});
        }
        else{
            res.status(404).json({ message: "Products not found or already deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error fetching Products" });
    }
}); 

router.get("/getProductById/:id", authenJWT, authorizePermission("edit_product"), async(req, res) =>{
    try{
        const productId = parseInt(req.params.id);
        const product = await mysql.getProductById(productId);
        if(product){
            // console.log("Product fetched: ", product);
            res.json({message: "Product found!", product});
        }
        else{
            res.status(404).json({ message: "Product not found or already deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error fetching Product" });
    }
}); //test: curl -X GET http://localhost:5000/api/getProductById/1 -H "Authorization: Bearer TOKEN_HERE"

router.get("/getProductJoinedInformation", authenJWT, authorizePermission("edit_stock"), async (req, res) => {
	const offset = parseInt(req.query.offset) || 0;
	const limit  = parseInt(req.query.limit)  || 100;

	try {
		const auditJoinedInformation = await mysql.getAuditJoinedInformation(offset, limit);

		if (auditJoinedInformation && auditJoinedInformation.length > 0) {
			res.json({ message: "Expanded Product Log Entries found!", auditJoinedInformation });
		} else {
			res.status(404).json({ message: "No expanded product log entries found" });
		}
	} catch (err) {
		console.error("Error fetching expanded product log entries:", err);
		res.status(500).json({ message: "Error fetching expanded product log entries" });
	}
});

// GET /api/stockHistory?productId=…
// returns { dates: [...], stockLevels: [...], sales: [...] } for the last 30 days
router.get('/stockHistory', async (req, res) => {
  try {
    const pid = Number(req.query.productId);
    if (!pid) return res.status(400).json({ message: 'productId is required' });

    // 1. Define our window: last 30 days
    const endDate   = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 30);

    // format for MySQL DATETIME
    const fmt = d => d.toISOString().slice(0,19).replace('T',' ');
    const startStr = fmt(startDate);
    const endStr   = fmt(endDate);

    // 2. Pull daily sales from paid orders
    const [salesRows] = await db.query(
      `SELECT DATE(o.dateOrdered) AS date,
              SUM(oi.quantity)    AS salesQty
       FROM Orders o
       JOIN OrderInfo oi ON o.orderId = oi.orderId
       WHERE oi.productId   = ?
         AND o.paymentStatus = 'paid'
         AND o.dateOrdered BETWEEN ? AND ?
       GROUP BY DATE(o.dateOrdered)`,
      [pid, startStr, endStr]
    );

    // 3. Pull daily stock entries
    const [entryRows] = await db.query(
      `SELECT DATE(dateReceived)     AS date,
              SUM(quantityReceived) AS recvQty
       FROM StockEntry
       WHERE productId   = ?
         AND dateReceived BETWEEN ? AND ?
       GROUP BY DATE(dateReceived)`,
      [pid, startStr, endStr]
    );

    // 4. Pull daily withdrawals
    const [withdrawRows] = await db.query(
      `SELECT DATE(sw.dateWithdrawn)     AS date,
              SUM(sw.quantityWithdrawn) AS withdrawQty
       FROM StockWithdrawal sw
       JOIN StockEntry se ON sw.entryId = se.entryId
       WHERE se.productId      = ?
         AND sw.dateWithdrawn BETWEEN ? AND ?
       GROUP BY DATE(sw.dateWithdrawn)`,
      [pid, startStr, endStr]
    );

    // 5. Compute initial stock = all received − all withdrawn before startDate
    const [[{ totalRecvBefore = 0 }]] = await db.query(
      `SELECT IFNULL(SUM(quantityReceived),0) AS totalRecvBefore
       FROM StockEntry
       WHERE productId = ? AND dateReceived < ?`,
      [pid, startStr]
    );
    const [[{ totalWithdrawBefore = 0 }]] = await db.query(
      `SELECT IFNULL(SUM(sw.quantityWithdrawn),0) AS totalWithdrawBefore
       FROM StockWithdrawal sw
       JOIN StockEntry se ON sw.entryId = se.entryId
       WHERE se.productId = ? AND sw.dateWithdrawn < ?`,
      [pid, startStr]
    );
    let runningStock = totalRecvBefore - totalWithdrawBefore;

    // 6. Build day‑by‑day arrays
    const dates       = [];
    const stockLevels = [];
    const sales       = [];
    const oneDayMs    = 24 * 60 * 60 * 1000;

    for (let ts = startDate.getTime(); ts <= endDate.getTime(); ts += oneDayMs) {
      const d        = new Date(ts);
      const day      = d.toISOString().slice(0,10);
      dates.push(day);

      // look up sums for this date (or zero)
      const recv     = entryRows.find(r => r.date === day)?.recvQty      || 0;
      const withdr   = withdrawRows.find(r => r.date === day)?.withdrawQty || 0;
      const sold     = salesRows  .find(r => r.date === day)?.salesQty    || 0;

      // update runningStock by physical movements only
      runningStock   += recv - withdr;

      stockLevels.push(runningStock);
      sales.push(sold);
    }

    // 7. Return the series
    res.json({ dates, stockLevels, sales });
  }
  catch (err) {
    console.error('⚡️ GET /api/stockHistory error:', err);
    res.status(500).json({ message: 'Error fetching stock history' });
  }
});


router.put("/updateProduct/:id", authenJWT, authorizePermission("edit_product"), async(req, res) =>{
    try{
        const productId = parseInt(req.params.id);
        const updatedData = req.body;
        const lastEditedDate = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        const lastEditedUser = req.user.userId;
        updatedData.lastEditedDate = lastEditedDate;
        updatedData.lastEditedUser = lastEditedUser;
        const result = await mysql.updateProductById(productId, updatedData);
        if(result){
            await logAudit("edit_product", `Updated product ID ${productId})`, req.user.userId);
            res.json({ message: "Product updated successfully!", id: productId });
        }
        else{
            res.status(404).json({ message: "Product not found or not updated" });
        }
    }catch(err){
        await auditModel.logAudit(
            "edit_stock",
            `Error occurred while updating product with ID ${req.params.id}.`,
            req.user?.userId || null
        );
        res.status(500).json({ message: "Error updating Product" });
    }
}); //test: curl -X PUT http://localhost:5000/api/updateProduct/1 -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN_HERE" -d "{\"productName\":\"Updated Ping Pong Pan\",\"category\":\"paddle\",\"descriptions\":\"Updated description\",\"supplier\":\"new supplier\",\"cost\":110,\"retailPrice\":160}"

router.delete("/deleteProduct/:id", authenJWT, authorizePermission("edit_product"), async(req, res) =>{
    try{
        const productId = parseInt(req.params.id);
        const deleted = await mysql.cascadeDeleteProduct(productId);
        
        if(deleted){
            await logAudit("delete_product", `Deleted product ID ${productId})`, req.user.userId);
            res.json({ message: "Product deleted successfully!", id: productId });
        }
        else{
            res.status(404).json({ message: "Product not found or not deleted" });
        }
    }catch(err){
        await auditModel.logAudit(
            "delete_stock",
            `Error occurred while deleting product with ID ${req.params.id}.`,
            req.user?.userId || null
        );
        res.status(500).json({ message: "Error deleting Product" });
    }
}); //test: curl -X DELETE http://localhost:5000/api/deleteProduct/1 -H "Authorization: Bearer TOKEN_HERE"

export default router;