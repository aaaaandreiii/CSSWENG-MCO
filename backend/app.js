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

// --- Allow listed domains for CORS ---
const allowedOrigins = [
  process.env.PUBLIC_API_BASE_URL,
  'https://cssweng-mco.vercel.app',
  'http://localhost:5173',
].filter(Boolean);

console.log("▶️ CORS — allowedOrigins:", allowedOrigins);

// --- CORS middleware ---
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error('❌ Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options("/api/*", cors(corsOptions));

app.use(cors(corsOptions));
app.options("/api/*", cors(corsOptions));

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