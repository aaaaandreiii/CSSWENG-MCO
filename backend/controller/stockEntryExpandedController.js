import express from "express";
import * as mysql from "../model/stockEntryExpandedModel.js";
import { authenJWT } from "../middleware/authenJWT.js";
import { authorizePermission } from "../middleware/authoPerms.js";

const router = express.Router();

router.get("/getStockEntryExpanded", authenJWT, authorizePermission("edit_stock"), async (req, res) => {
	try {
		const stockEntryExpanded = await mysql.getStockEntryExpanded();

		if (stockEntryExpanded && stockEntryExpanded.length > 0) {
			res.json({ message: "Expanded Stock Entries found!", stockEntryExpanded });
		} else {
			res.status(404).json({ message: "No expanded stock entries found" });
		}
	} catch (err) {
		console.error("Error fetching expanded stock entries:", err);
		res.status(500).json({ message: "Error fetching expanded stock entries" });
	}
});

export default router;
