import db from "./db.js"
import _ from "lodash";

export async function getMergeOrders() {
	try {
		const [orders] = await db.query('SELECT * FROM Orders WHERE deleteFlag = 0');
		const [orderInfo] = await db.query('SELECT * FROM OrderInfo WHERE deleteFlag = 0');

		const groupedItems = _.groupBy(orderInfo, 'orderId');

		// Flatten each order + its items
		const merged = orders.flatMap(order => {
			const items = groupedItems[order.orderId];

			// if (!items || items.length === 0) {
			// 	// If no items, still return one row with null item fields
			// 	return [{
			// 		...order,
			// 		orderInfoId: null,
			// 		quantity: null,
			// 		productId: null,
			// 		unitPriceAtPurchase: null,
			// 		lastEditedDate: null,
			// 		lastEditedUser: null
			// 	}];
			// }

			// Otherwise, return one row per item
			return (items || []).map(item => ({
				...order,
				orderInfoId: item.orderInfoId,
				quantity: item.quantity,
				productId: item.productId,
				unitPriceAtPurchase: item.unitPriceAtPurchase,
				lastEditedDate: item.lastEditedDate,
				lastEditedUser: item.lastEditedUser
			}));
		});
		console.log("Flattened merged orders:", merged.length);
		return merged;
	} catch (err) {
		console.error("Error merging orders and order info:", err);
		throw err;
	}
}
