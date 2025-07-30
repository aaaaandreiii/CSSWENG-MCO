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

router.post("/createStockEntryExpanded", authenJWT, authorizePermission("edit_stock"), async (req, res) => {
	try {
		const data = req.body;

		const requiredFields = [
			"productId",
			"branchName",
			"dateReceived",
			"quantityReceived",
			"deliveryReceiptNumber",
			"receivedBy",
			"lastEditedUser",
			"lastEditedDate"
		];

		for (const field of requiredFields) {
			if (!data.hasOwnProperty(field)) {
				return res.status(400).json({ message: `Missing field: ${field}` });
			}
		}

		const result = await mysql.createStockEntry(data);
		res.status(201).json({ message: "Stock entry created successfully.", id: result.insertId });
	} catch (err) {
		console.error("[ERROR] createStockEntryExpanded:", err);
		res.status(500).json({ message: "Error creating stock entry." });
	}
});

// export async function mysql.updateStockEntryExpanded(req, res) {
// 	const entryId = req.params.id;
// 	try {
// 		const result = await updateStockEntry(entryId, req.body);
// 		res.status(200).json({
// 			message: "Stock entry updated successfully.",
// 			result
// 		});
// 	} catch (err) {
// 		console.error(`[ERROR] updateStockEntryController(${entryId}):`, err.message);
// 		res.status(500).json({ message: "Error updating stock entry." });
// 	}
// }

router.delete("/deleteStockEntryExpanded/:id", authenJWT, authorizePermission("edit_stock"), async (req, res) => {
	const entryId = parseInt(req.params.id);

	if (isNaN(entryId)) {
		return res.status(400).json({ message: "Invalid entry ID." });
	}

	try {
		const result = await mysql.deleteStockEntryById(entryId);

		if (result?.affectedRows === 0) {
			return res.status(404).json({ message: `Stock Entry ID ${entryId} not found.` });
		}

		res.json({ message: `Stock Entry ID ${entryId} deleted successfully.` });
	} catch (err) {
		console.error(`[ERROR] deleteStockEntryExpanded(${entryId}):`, err);
		res.status(500).json({ message: "Error deleting stock entry.", error: err.message });
	}
});

export default router;
