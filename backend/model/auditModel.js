import db, { processCascade } from "./db.js"

// CREATE: Add a new audit log entry
export function logAudit(actionType, description, userId) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO AuditLog (actionType, description, userId)
            VALUES (?, ?, ?)
        `;
        db.query(sql, [actionType, description, userId], (err, result) => {
            if (err) return reject(err);
            console.log("Audit log created:", result.insertId);
            resolve(result.insertId);
        });
    });
}

// READ: Get all audit logs (with full name of the user)
export function getAllAuditLogs() {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT AuditLog.*, Users.fullName
            FROM AuditLog
            JOIN Users ON AuditLog.userId = Users.userId
            ORDER BY AuditLog.timestamp DESC
        `;
        db.query(sql, (err, results) => {
            if (err) return reject(err);
            console.log("Audit logs fetched:", results.length);
            resolve(results);
        });
    });
}

// READ: Get audit logs for a specific user
export function getAuditLogsByUser(userId) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT *
            FROM AuditLog
            WHERE userId = ?
            ORDER BY timestamp DESC
        `;
        db.query(sql, [userId], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}
