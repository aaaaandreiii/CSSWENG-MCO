import db from "./db.js"

// CREATE: Add a new audit log entry
// export function logAudit(actionType, description, userId) {
export async function logAudit(actionType, description, userId) {
    // return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO AuditLog (actionType, description, userId)
            VALUES (?, ?, ?)
        `;
    //     db.query(sql, [actionType, description, userId], (err, result) => {
    //         if (err) return reject(err);
    //         console.log("Audit log created:", result.insertId);
    //         resolve(result.insertId);
    //     });
    // });
    const [result] = await db.query(sql, [
        actionType, description, userId
    ]);
    console.log("Audit log created:", result.insertId);
    return result.insertId;
}

// READ: Get all audit logs (with full name of the user)
// export function getAllAuditLogs() {
export async function getAllAuditLogs() {
    // return new Promise((resolve, reject) => {
        const sql = `
            SELECT AuditLog.*, Users.fullName
            FROM AuditLog
            JOIN Users ON AuditLog.userId = Users.userId
            ORDER BY AuditLog.timestamp DESC
        `;
    //     db.query(sql, (err, results) => {
    //         if (err) return reject(err);
    //         console.log("Audit logs fetched:", results.length);
    //         resolve(results);
    //     });
    // });
    const [results] = await db.query(sql);
    console.log("Audit logs fetched:", results.length);
    return results;
}

// READ: Get audit logs for a specific user
// export function getAuditLogsByUser(userId) {
export async function getAuditLogsByUser(userId) {
    // return new Promise((resolve, reject) => {
        const sql = `
            SELECT *
            FROM AuditLog
            WHERE userId = ?
            ORDER BY timestamp DESC
        `;
    //     db.query(sql, [userId], (err, results) => {
    //         if (err) return reject(err);
    //         resolve(results);
    //     });
    // });
    const [results] = await db.query(sql, [userId]);
    if (results.length) {
        console.log("Audit log entry found:", results[0]);
        return results[0];
    } else {
        console.log("Audit log entry not found or deleted.");
        return null;
    }
}

// READ: Get expanded audit log information with user details
export async function getAuditJoinedInformation(offset = 0, limit = 100) {
	const sql = `
		SELECT
            al.auditId,
            al.actionType,
            al.description,
            al.timestamp,
            al.userId,
            u.fullName    AS performedBy,
            u.username,
            u.userRole
        FROM
            AuditLog AS al
        LEFT JOIN Users AS u
            ON al.userId = u.userId
        ORDER BY
            al.timestamp DESC
        LIMIT ? OFFSET ?;
	`;

	try {
		const [results] = await db.query(sql, [limit, offset]);
		console.log("Expanded Audit Logs:", results.length);

		if (results.length === 0) {
			console.warn("⚠️ No expanded audit log entries returned. Check foreign key links or LEFT JOIN for diagnostics.");
		}

		return results;
	} catch (err) {
		console.error("❌ Error in getAuditJoinedInformation():", err);
		throw err;
	}
}
