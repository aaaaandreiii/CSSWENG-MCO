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

router.put("/updateStockEntryExpanded/:id", authenJWT, authorizePermission("edit_stock"), async (req, res) => {
	const entryId = parseInt(req.params.id);

	if (isNaN(entryId)) {
		return res.status(400).json({ message: "Invalid entry ID." });
	}

	try {
		const result = await mysql.updateStockEntry(entryId, req.body);

		if (result.affectedRows === 0) {
			return res.status(404).json({ message: `Stock Entry ID ${entryId} not found.` });
		}

		res.json({ message: `Stock Entry ID ${entryId} updated successfully.` });
	} catch (err) {
		console.error(`[ERROR] updateStockEntryExpanded(${entryId}):`, err);
		res.status(500).json({ message: "Error updating stock entry.", error: err.message });
	}
});


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

router.get("/stockEntry/productId/:id", authenJWT, authorizePermission("edit_stock"), async (req, res) => {
	try {
		const row = await mysql.getProductIdByEntryId(req.params.id);
		if (!row) return res.status(404).json({ message: "Product ID not found." });
		res.json({ productId: row.productId });
	} catch (err) {
		console.error("[ERROR] fetchProductId:", err);
		res.status(500).json({ message: "Failed to fetch product ID." });
	}
});

router.get("/stockEntry/receivedBy/:id", authenJWT, authorizePermission("edit_stock"), async (req, res) => {
	try {
		const row = await mysql.getReceivedByByEntryId(req.params.id);
		if (!row) return res.status(404).json({ message: "ReceivedBy not found." });
		res.json({ receivedBy: row.receivedBy });
	} catch (err) {
		console.error("[ERROR] fetchReceivedBy:", err);
		res.status(500).json({ message: "Failed to fetch receivedBy." });
	}
});

router.get("/stockEntry/lastEditedUser/:id", authenJWT, authorizePermission("edit_stock"), async (req, res) => {
	try {
		const row = await mysql.getLastEditedUserByEntryId(req.params.id);
		if (!row) return res.status(404).json({ message: "LastEditedUser not found." });
		res.json({ lastEditedUser: row.lastEditedUser });
	} catch (err) {
		console.error("[ERROR] fetchLastEditedUser:", err);
		res.status(500).json({ message: "Failed to fetch lastEditedUser." });
	}
});

export default router;
