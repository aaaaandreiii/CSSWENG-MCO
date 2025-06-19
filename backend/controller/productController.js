import express from "express";
import * as mysql from "../model/productModel.js";

const router = express.Router();

router.post("/createProduct", async(req, res) =>{
    try{
        const {productName, category, descriptions, supplier, cost, retailPrice} = req.body;
        const id = await mysql.createProduct(productName, category, descriptions, supplier, "active", cost, retailPrice);
        res.json({message: "Product created successfully!", id});
    }catch(err){
        res.status(500).json({ message: "Error creating Product" });
    }
}); //test: curl -X POST http://localhost:5000/api/createProduct -H "Content-Type: application/json" -d "{\"productName\":\"Ping Pong Ball\",\"category\":\"ball\",\"descriptions\":\"descriptionss\",\"supplier\":\"someone\",\"cost\":100,\"retailPrice\":150}"
// test: curl -X POST http://localhost:5000/api/createProduct -H "Content-Type: application/json" -d "{\"productName\":\"Ping Pong Pan\",\"category\":\"paddle\",\"descriptions\":\"descriptionss\",\"supplier\":\"someone\",\"cost\":100,\"retailPrice\":150}"
export default router;