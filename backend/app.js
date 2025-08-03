import express from "express";
import cors from "cors";
import userController from "./controller/userController.js";
import productController from "./controller/productController.js";
import stockEntryController from "./controller/stockEntryController.js";
import stockWithdrawalController from "./controller/stockWithdrawalController.js";
import ordersController from "./controller/ordersController.js";
import returnExchangeController from "./controller/returnExchangeController.js";
import { bootstrapAdminUser } from "./model/userModel.js";
import stockEntryExpandedController from "./controller/stockEntryExpandedController.js";
import auditController from "./controller/auditController.js";
import stockWithdrawalExpandedController from "./controller/stockWithdrawalExpandedController.js";
// import * as mysql from "./model/userModel.js";
import dataAnalysisController from './controller/dataAnalysisController.js';
import searchController from './controller/searchController.js';
import dashboardRouter from './controller/dashboardController.js';

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  'https://cssweng-mco.vercel.app'
].filter(Boolean);

const corsOptions = {
  origin: (incomingOrigin, callback) => {
    if (!incomingOrigin || allowedOrigins.includes(incomingOrigin)) {
      callback(null, incomingOrigin);   //echo back the request Origin
    } else {
      callback(new Error(`Origin ${incomingOrigin} not allowed by CORS`));
    }
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,  //or true if using cookies/auth headers
};
app.use(cors(corsOptions));

// app.use(cors({
//   origin: allowedOrigins,
//   methods: ['GET','POST','PUT','DELETE','OPTIONS'],
//   allowedHeaders: ['Content-Type','Authorization']
// })); //enable CORS during development
// app.use(express.json());

//controllers
app.use("/api", userController);
app.use("/api", productController);
app.use("/api", stockEntryController);
app.use("/api", stockWithdrawalController);
app.use("/api", ordersController);
app.use("/api", returnExchangeController);
app.use("/api/dataAnalysisController", dataAnalysisController);
app.use("/api", stockEntryExpandedController);
app.use("/api", stockWithdrawalExpandedController);
app.use("/api", auditController);
app.use("/api/search", searchController);
app.use('/api/dashboard', dashboardRouter);

bootstrapAdminUser().catch(console.error);

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});