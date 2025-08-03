import db from "./db.js";

// EXPANDED READ with diagnostics
export async function getStockEntryExpanded() {
	const sql = `
		SELECT
            se.entryId AS \`Entry ID\`,
            se.branchName AS \`Branch Name\`,
            se.dateReceived AS \`Date Received\`,
            se.quantityReceived AS \`Quantity Received\`,
            se.deliveryReceiptNumber AS \`Delivery Receipt Number\`,
            p.productName AS \`Product Name\`,
            ru.fullName AS \`Received By\`,
            eu.fullName AS \`Last Edited By\`,
            se.lastEditedDate AS \`Last Edited Date\`
            FROM mydb.StockEntry se
            JOIN mydb.Product p ON p.productId = se.productId
            JOIN mydb.Users ru ON ru.userId = se.receivedBy
            JOIN mydb.Users eu ON eu.userId = se.lastEditedUser
            WHERE se.deleteFlag = 0
	`;

	try {
		const [results] = await db.query(sql);
		console.log("Expanded Stock Entries:", results.length);

		if (results.length === 0) {
			console.warn("No expanded stock entries returned. Check foreign key links or LEFT JOIN for diagnostics.");
		}

		return results;
	} catch (err) {
		console.error("Error in getStockEntryExpanded():", err);
		throw err;
	}
}

export async function createStockEntry(data) {
	const query = `
		INSERT INTO StockEntry
			(productId, quantityReceived, deliveryReceiptNumber,
			 dateReceived, receivedBy, lastEditedUser, lastEditedDate, branchName, deleteFlag)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
	`;

	const values = [
		data.productId,
		data.quantityReceived,
		data.deliveryReceiptNumber,
		data.dateReceived,
		data.receivedBy,
		data.lastEditedUser,
		data.lastEditedDate,
		data.branchName
	];

	try {
		const [result] = await db.query(query, values);
		console.log("[INFO] createStockEntry: Inserted with ID =", result.insertId);
		console.log("[DEBUG] Data inserted:", values);
		return result;
	} catch (err) {
		console.error("[ERROR] createStockEntry:", err.message);
		throw err;
	}
}

export async function deleteStockEntryById(entryId) {
	try {
		console.log(`[DEBUG] Deleting entryId = ${entryId}`);

		const [result] = await db.query(
			`UPDATE StockEntry SET deleteFlag = 1 WHERE entryId = ?`,
			[entryId]
		);

		if (result.affectedRows === 0) {
			console.warn(`[WARN] deleteStockEntryById(): ID ${entryId} not found or already deleted.`);
			throw new Error("Stock entry not found.");
		}

		console.log(`[INFO] Stock Entry ID ${entryId} soft deleted.`);
		return { success: true, entryId };
	} catch (err) {
		console.error(`[ERROR] deleteStockEntryById(${entryId}):`, err.message);
		throw err;
	}
}

export async function getProductIdByEntryId(entryId) {
	const [rows] = await db.query(
		"SELECT productId FROM StockEntry WHERE entryId = ? AND deleteFlag = 0",
		[entryId]
	);
	return rows[0] || null;
}

export async function getReceivedByByEntryId(entryId) {
	const [rows] = await db.query(
		"SELECT receivedBy FROM StockEntry WHERE entryId = ? AND deleteFlag = 0",
		[entryId]
	);
	return rows[0] || null;
}

export async function getLastEditedUserByEntryId(entryId) {
	const [rows] = await db.query(
		"SELECT lastEditedUser FROM StockEntry WHERE entryId = ? AND deleteFlag = 0",
		[entryId]
	);
	return rows[0] || null;
}

export async function updateStockEntry(entryId, data) {
	const query = `
		UPDATE StockEntry
		SET 
			branchName = ?, 
			dateReceived = ?, 
			quantityReceived = ?, 
			deliveryReceiptNumber = ?, 
			receivedBy = ?, 
			productId = ?, 
			lastEditedUser = ?, 
			lastEditedDate = ?, 
			deleteFlag = ?
		WHERE entryId = ?
	`;

	const values = [
		data.productId ?? null,
		data.branchName ?? null,
		data.dateReceived ?? null,
		data.quantityReceived ?? null,
		data.deliveryReceiptNumber ?? null,
		data.receivedBy ?? null,
		data.lastEditedUser ?? null,
		data.lastEditedDate ?? null,
		data.deleteFlag ?? 0,
		entryId
	];

	try {
		const [result] = await db.query(query, values);
		console.log(`[INFO] updateStockEntry: ID ${entryId} updated.`);
		return result;
	} catch (err) {
		console.error(`[ERROR] updateStockEntry(${entryId}):`, err.message);
		throw err;
	}
}