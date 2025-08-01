import express from "express";
import * as mysql from "../model/stockWithdrawalExpandedModel.js";
import { authenJWT } from "../middleware/authenJWT.js";
import { authorizePermission } from "../middleware/authoPerms.js";

const router = express.Router();

router.get("/getStockOutExpanded", authenJWT, authorizePermission("edit_stock"), async (req, res) => {
	try {
		const withdrawals = await mysql.getStockOutExpanded();
		if (withdrawals && withdrawals.length > 0) {
			res.json({ message: "Expanded Stock Withdrawals found!", stockOut: withdrawals });
		} else {
			res.status(404).json({ message: "No stock withdrawals found." });
		}
	} catch (err) {
		console.error("Backend error for stock out expanded:", err);
		res.status(500).json({ message: "Error fetching stock out expanded data" });
	}
});

// POST /api/createStockOutExpanded
router.post("/createStockOutExpanded", authenJWT, authorizePermission("edit_stock"), async (req, res) => {
	try {
		const data = req.body;

		const requiredFields = [
			"entryId",
			"quantityWithdrawn",
			"purpose",
			"withdrawnBy",
			"authorizedBy",
			"lastEditedUser",
			"dateWithdrawn",
			"lastEditedDate"
		];

		for (const field of requiredFields) {
			if (!data.hasOwnProperty(field)) {
				return res.status(400).json({ message: `Missing field: ${field}` });
			}
		}

		const result = await mysql.createStockWithdrawal(data);
		res.status(201).json({ message: "Stock withdrawal created successfully.", id: result.insertId });
	} catch (err) {
		console.error("[ERROR] createStockOutExpanded:", err);
		res.status(500).json({ message: "Error creating stock withdrawal." });
	}
});

// PUT /api/updateStockOutExpanded/:id
router.put("/updateStockOutExpanded/:id", authenJWT, authorizePermission("edit_stock"), async (req, res) => {
	const withdrawalId = parseInt(req.params.id);

	if (isNaN(withdrawalId)) {
		return res.status(400).json({ message: "Invalid withdrawal ID." });
	}

	try {
		const data = req.body;
		const result = await mysql.updateStockWithdrawal(withdrawalId, data);

		if (result.affectedRows === 0) {
			return res.status(404).json({ message: `Withdrawal ID ${withdrawalId} not found.` });
		}

		res.json({ message: `Withdrawal ID ${withdrawalId} updated successfully.` });
	} catch (err) {
		console.error(`[ERROR] updateStockOutExpanded(${withdrawalId}):`, err);
		res.status(500).json({ message: "Error updating stock withdrawal." });
	}
});


router.delete("/deleteStockOutExpanded/:id", authenJWT, authorizePermission("edit_stock"), async (req, res) => {
	const withdrawalId = parseInt(req.params.id);

	if (isNaN(withdrawalId)) {
		return res.status(400).json({ message: "Invalid withdrawal ID." });
	}

	try {
		const result = await mysql.deleteStockWithdrawalById(withdrawalId);

		if (result?.affectedRows === 0) {
			return res.status(404).json({ message: `Withdrawal ID ${withdrawalId} not found.` });
		}

		res.json({ message: `Withdrawal ID ${withdrawalId} deleted successfully.` });
	} catch (err) {
		console.error(`[ERROR] deleteStockOutExpanded(${withdrawalId}):`, err);
		res.status(500).json({ message: "Error deleting stock withdrawal.", error: err.message });
	}
});

export default router;
