import express from "express";
import * as mysql from "../model/auditModel.js";
import { authenJWT } from "../middleware/authenJWT.js";
import { authorizePermission } from "../middleware/authoPerms.js";

const router = express.Router();

router.get("/getAuditJoinedInformation", authenJWT, authorizePermission("edit_stock"), async (req, res) => {
	const offset = parseInt(req.query.offset) || 0;
	const limit  = parseInt(req.query.limit)  || 100;

	try {
		const auditJoinedInformation = await mysql.getAuditJoinedInformation(offset, limit);

		if (auditJoinedInformation && auditJoinedInformation.length > 0) {
			res.json({ message: "Expanded Audit Log Entries found!", auditJoinedInformation });
		} else {
			res.status(404).json({ message: "No expanded audit log entries found" });
		}
	} catch (err) {
		console.error("Error fetching expanded audit log entries:", err);
		res.status(500).json({ message: "Error fetching expanded audit log entries" });
	}
});

export default router;
