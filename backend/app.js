import express from "express";
import cors from "cors";
import userController from "./controller/userController.js";
import productController from "./controller/productController.js";
import stockEntryController from "./controller/stockEntryController.js";
import stockWithdrawalController from "./controller/stockWithdrawalController.js";
import ordersController from "./controller/ordersController.js";
import returnExchangeController from "./controller/returnExchangeController.js";
import { bootstrapAdminUser } from "./model/userModel.js";
// import * as mysql from "./model/userModel.js";

const app = express();

app.use(cors({
    origin: 'http://localhost:5173'
})); //enable CORS during development
app.use(express.json());

//controllers
app.use("/api", userController);
app.use("/api", productController);
app.use("/api", stockEntryController);
app.use("/api", stockWithdrawalController);
app.use("/api", ordersController);
app.use("/api", returnExchangeController);

bootstrapAdminUser().catch(console.error);

// (async() =>{
//     const date = new Date("2015-02-03");
//     await mysql.createUser("A", "admin", "aaa", "123", null, date, date, 1, 0);
// })();

app.listen(5000, () => console.log("Server listening on port 5000."));
