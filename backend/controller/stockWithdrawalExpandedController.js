import express from "express";
import * as mysql from "../model/stockWithdrawalExpandedModel.js";
import { authenJWT } from "../middleware/authenJWT.js";
import { authorizePermission } from "../middleware/authoPerms.js";

const router = express.Router();

// GET all expanded stock withdrawals
router.get("/getStockOutExpanded", authenJWT, authorizePermission("edit_stock"), async (req, res) => {
	try {
		const withdrawals = await mysql.getStockOutExpanded();
		if (withdrawals?.length > 0) {
			res.json({ message: "Expanded Stock Withdrawals found!", stockOut: withdrawals });
		} else {
			res.status(404).json({ message: "No stock withdrawals found." });
		}
	} catch (err) {
		console.error("Error fetching expanded stock withdrawals:", err);
		res.status(500).json({ message: "Error fetching stock out expanded data." });
	}
});

// POST create a new stock withdrawal
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

// PUT update an existing stock withdrawal
router.put("/updateStockOutExpanded/:id", authenJWT, authorizePermission("edit_stock"), async (req, res) => {
	const withdrawalId = parseInt(req.params.id);

	if (isNaN(withdrawalId)) {
		return res.status(400).json({ message: "Invalid withdrawal ID." });
	}

	try {
		const result = await mysql.updateStockWithdrawal(withdrawalId, req.body);

		if (result.affectedRows === 0) {
			return res.status(404).json({ message: `Withdrawal ID ${withdrawalId} not found.` });
		}

		res.json({ message: `Withdrawal ID ${withdrawalId} updated successfully.` });
	} catch (err) {
		console.error(`[ERROR] updateStockOutExpanded(${withdrawalId}):`, err.message);
		res.status(500).json({ message: "Error updating stock withdrawal.", error: err.message });
	}
});

// DELETE stock withdrawal
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
		console.error(`[ERROR] deleteStockOutExpanded(${withdrawalId}):`, err.message);
		res.status(500).json({ message: "Error deleting stock withdrawal.", error: err.message });
	}
});

router.get("/stockWithdrawal/entryId/:id", authenJWT, authorizePermission("edit_stock"), async (req, res) => {
	try {
		const row = await mysql.getEntryIdByWithdrawalId(req.params.id);
		if (!row) return res.status(404).json({ message: "entryId not found." });
		res.json({ entryId: row.entryId });
	} catch (err) {
		console.error("[ERROR] fetchEntryId:", err);
		res.status(500).json({ message: "Failed to fetch entryId." });
	}
});

// FK GET: withdrawnBy
router.get("/stockWithdrawal/withdrawnBy/:id", authenJWT, authorizePermission("edit_stock"), async (req, res) => {
	try {
		const row = await mysql.getWithdrawnByByWithdrawalId(req.params.id);
		if (!row) return res.status(404).json({ message: "withdrawnBy not found." });
		res.json({ withdrawnBy: row.withdrawnBy });
	} catch (err) {
		console.error("[ERROR] fetchWithdrawnBy:", err.message);
		res.status(500).json({ message: "Failed to fetch withdrawnBy." });
	}
});

// FK GET: authorizedBy
router.get("/stockWithdrawal/authorizedBy/:id", authenJWT, authorizePermission("edit_stock"), async (req, res) => {
	try {
		const row = await mysql.getAuthorizedByByWithdrawalId(req.params.id);
		if (!row) return res.status(404).json({ message: "authorizedBy not found." });
		res.json({ authorizedBy: row.authorizedBy });
	} catch (err) {
		console.error("[ERROR] fetchAuthorizedBy:", err.message);
		res.status(500).json({ message: "Failed to fetch authorizedBy." });
	}
});

// FK GET: lastEditedUser
router.get("/stockWithdrawal/lastEditedUser/:id", authenJWT, authorizePermission("edit_stock"), async (req, res) => {
	try {
		const row = await mysql.getLastEditedUserByWithdrawalId(req.params.id);
		if (!row) return res.status(404).json({ message: "lastEditedUser not found." });
		res.json({ lastEditedUser: row.lastEditedUser });
	} catch (err) {
		console.error("[ERROR] fetchLastEditedUser:", err.message);
		res.status(500).json({ message: "Failed to fetch lastEditedUser." });
	}
});

export default router;