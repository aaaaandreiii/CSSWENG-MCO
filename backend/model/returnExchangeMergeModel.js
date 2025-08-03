import db from "./db.js";
import _ from "lodash";

export async function getMergeReturns() {
	try {
		const [returns] = await db.query('SELECT * FROM ReturnExchange WHERE deleteFlag = 0');
		const [returnDetails] = await db.query('SELECT * FROM ReturnExchangeInfo WHERE deleteFlag = 0');

		// Group return details by transactionId
		const groupedDetails = _.groupBy(returnDetails, 'transactionId');

		// Flatten each ReturnExchange + its detail rows
		const merged = returns.flatMap(transaction => {
			const details = groupedDetails[transaction.transactionId] || []; 
			return details.map(detail => ({
                    ...transaction,
                    detailId: detail.detailId,
                    returnedProductId: detail.returnedProductId,
                    returnedQuantity: detail.returnedQuantity,
                    exchangeProductId: detail.exchangeProductId,
                    exchangeQuantity: detail.exchangeQuantity,
                    reason: detail.reason,
                    returnType: detail.returnType,
                    lastEditedDate: detail.lastEditedDate,
                    lastEditedUser: detail.lastEditedUser
                }));
		});

		console.log("Flattened merged returns:", merged.length);
		return merged;
	} catch (err) {
		console.error("Error merging returns and return details:", err);
		throw err;
	}
}
