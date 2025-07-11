import express from "express";
import * as mysql from "../model/productModel.js";

const router = express.Router();

router.post("/createProduct", async(req, res) =>{
    try{
        const {productName, category, descriptions, supplier, cost, retailPrice} = req.body;
        const productId = await mysql.createProduct(productName, category, descriptions, supplier, cost, retailPrice, 0);
        res.json({message: "Product created successfully!", id: productId});
    }catch(err){
        res.status(500).json({ message: "Error creating Product" });
    }
}); //test: curl -X POST http://localhost:5000/api/createProduct -H "Content-Type: application/json" -d "{\"productName\":\"Ping Pong Ball\",\"category\":\"ball\",\"descriptions\":\"descriptionss\",\"supplier\":\"someone\",\"cost\":100,\"retailPrice\":150}"
// test: curl -X POST http://localhost:5000/api/createProduct -H "Content-Type: application/json" -d "{\"productName\":\"Ping Pong Pan\",\"category\":\"paddle\",\"descriptions\":\"descriptionss\",\"supplier\":\"someone\",\"cost\":100,\"retailPrice\":150}"

router.get("/getProducts", async(req, res) =>{
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
}); //test: curl -X GET http://localhost:5000/api/getProducts

router.get("/getProductById/:id", async(req, res) =>{
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
}); //test: curl -X GET http://localhost:5000/api/getProductById/1

router.put("/updateProduct/:id", async(req, res) =>{
    try{
        const productId = parseInt(req.params.id);
        const updatedData = req.body;
        const result = await mysql.updateProductById(productId, updatedData);
        if(result){
            res.json({ message: "Product updated successfully!", id: productId });
        }
        else{
            res.status(404).json({ message: "Product not found or not updated" });
        }
    }catch(err){
        res.status(500).json({ message: "Error updating Product" });
    }
}); //test: curl -X PUT http://localhost:5000/api/updateProduct/1 -H "Content-Type: application/json" -d "{\"productName\":\"Updated Ping Pong Pan\",\"category\":\"paddle\",\"descriptions\":\"Updated description\",\"supplier\":\"new supplier\",\"cost\":110,\"retailPrice\":160}"

router.delete("/deleteProduct/:id", async(req, res) =>{
    try{
        const productId = parseInt(req.params.id);
        const deleted = await mysql.cascadeDeleteProduct(productId);
        if(deleted){
            res.json({ message: "Product deleted successfully!", id: productId });
        }
        else{
            res.status(404).json({ message: "Product not found or not deleted" });
        }
    }catch(err){
        res.status(500).json({ message: "Error deleting Product" });
    }
}); //test: curl -X DELETE http://localhost:5000/api/deleteProduct/1

export default router;