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
