import express from "express";
import cors from "cors";
import userController from "./controller/userController.js";
import productController from "./controller/productController.js";
import stockEntryController from "./controller/stockEntryController.js";
import stockWithdrawalController from "./controller/stockWithdrawal.js";
import ordersController from "./controller/ordersController.js";
import returnExchangeController from "./controller/returnExchangeController.js";

const app = express();

app.use(cors()); //enable CORS during development
app.use(express.json());

//controllers
app.use("/api", userController);
app.use("/api", productController);
app.use("/api", stockEntryController);
app.use("/api", stockWithdrawalController);
app.use("/api", ordersController);
app.use("/api", returnExchangeController);

app.listen(5000, () => console.log("Server listening on port 5000."));
