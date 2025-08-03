import db from "./db.js";

export async function getStockOutExpanded() {
	const sql = `
		SELECT
			sw.withdrawalId AS \`Withdrawal ID\`,
			sw.entryId AS \`Entry ID\`,
			sw.dateWithdrawn AS \`Date Withdrawn\`,
			sw.quantityWithdrawn AS \`Quantity Withdrawn\`,
			sw.purpose AS \`Purpose\`,
			se.branchName AS \`Branch Name\`,
			p.productName AS \`Product Name\`,
			wu.fullName AS \`Withdrawn By\`,
			au.fullName AS \`Authorized By\`,
			eu.fullName AS \`Last Edited By\`,
			sw.lastEditedDate AS \`Last Edited Date\`
		FROM StockWithdrawal sw
		JOIN StockEntry se ON se.entryId = sw.entryId
		JOIN Product p ON p.productId = se.productId
		JOIN Users wu ON wu.userId = sw.withdrawnBy
		JOIN Users au ON au.userId = sw.authorizedBy
		JOIN Users eu ON eu.userId = sw.lastEditedUser
		WHERE sw.deleteFlag = 0
	`;

	try {
		const [results] = await db.query(sql);
		console.log("Expanded Stock Withdrawals:", results.length);
		return results;
	} catch (err) {
		console.error("Error in getStockOutExpanded():", err);
		throw err;
	}
}

export async function deleteStockWithdrawalById(withdrawalId) {
	try {
		console.log(`[DEBUG] Deleting withdrawalId = ${withdrawalId}`);

		const [result] = await db.query(
			`UPDATE StockWithdrawal SET deleteFlag = 1 WHERE withdrawalId = ?`,
			[withdrawalId]
		);

		if (result.affectedRows === 0) {
			console.warn(`[WARN] deleteStockWithdrawalById(): ID ${withdrawalId} not found or already deleted.`);
			throw new Error("Stock withdrawal not found.");
		}

		console.log(`[INFO] Withdrawal ID ${withdrawalId} soft deleted.`);
		return { success: true, withdrawalId };
	} catch (err) {
		console.error(`[ERROR] deleteStockWithdrawalById(${withdrawalId}):`, err.message);
		throw err;
	}
}

export async function createStockWithdrawal(data) {
	const query = `
		INSERT INTO StockWithdrawal
			(entryId, quantityWithdrawn, purpose, withdrawnBy, authorizedBy, lastEditedUser, dateWithdrawn, lastEditedDate, deleteFlag)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`;

	const values = [
		data.entryId,
		data.quantityWithdrawn,
		data.purpose,
		data.withdrawnBy,
		data.authorizedBy,
		data.lastEditedUser,
		data.dateWithdrawn,
		data.lastEditedDate,
		0 // Set deleteFlag to 0 on insert
	];

	try {
		const [result] = await db.query(query, values);
		console.log("[INFO] insertStockWithdrawal: new ID =", result.insertId);
		return result;
	} catch (err) {
		console.error("[ERROR] insertStockWithdrawal:", err);
		throw err;
	}
}

export async function updateStockWithdrawal(withdrawalId, data) {
	const query = `
		UPDATE StockWithdrawal
		SET
			entryId = ?,
			quantityWithdrawn = ?,
			purpose = ?,
			withdrawnBy = ?,
			authorizedBy = ?,
			lastEditedUser = ?,
			dateWithdrawn = ?,
			lastEditedDate = ?,
			deleteFlag = ?
		WHERE withdrawalId = ?
	`;

	const values = [
		data.entryId,
		data.quantityWithdrawn,
		data.purpose,
		data.withdrawnBy,
		data.authorizedBy,
		data.lastEditedUser,
		data.dateWithdrawn,
		data.lastEditedDate,
		data.deleteFlag ?? 0, // default to 0 if undefined
		withdrawalId
	];

	try {
		const [result] = await db.query(query, values);
		console.log(`[INFO] updateStockWithdrawal: ID ${withdrawalId} updated.`);
		return result;
	} catch (err) {
		console.error(`[ERROR] updateStockWithdrawal(${withdrawalId}):`, err.message);
		throw err;
	}
}

export async function getEntryIdByWithdrawalId(withdrawalId) {
	const [rows] = await db.query(
		"SELECT entryId FROM StockWithdrawal WHERE withdrawalId = ? AND deleteFlag = 0",
		[withdrawalId]
	);
	return rows[0] || null;
}

export async function getWithdrawnByByWithdrawalId(withdrawalId) {
	const [rows] = await db.query(
		"SELECT withdrawnBy FROM StockWithdrawal WHERE withdrawalId = ? AND deleteFlag = 0",
		[withdrawalId]
	);
	return rows[0] || null;
}

export async function getAuthorizedByByWithdrawalId(withdrawalId) {
	const [rows] = await db.query(
		"SELECT authorizedBy FROM StockWithdrawal WHERE withdrawalId = ? AND deleteFlag = 0",
		[withdrawalId]
	);
	return rows[0] || null;
}

export async function getLastEditedUserByWithdrawalId(withdrawalId) {
	const [rows] = await db.query(
		"SELECT lastEditedUser FROM StockWithdrawal WHERE withdrawalId = ? AND deleteFlag = 0",
		[withdrawalId]
	);
	return rows[0] || null;
}
