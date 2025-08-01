// middleware/authorizePermission.js
import { rolePerms } from "./roleMatrix.js";

export function authorizePermission(requiredPermission) {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: No user logged in." });
    }

    const role = user.role;
    const permissions = rolePerms[role] || [];

    if (!permissions.includes(requiredPermission)) {
      console.warn(`Access Denied: User role "${role}" tried to access "${requiredPermission}"`);
      return res.status(403).json({
        message: `Error: Your role (${role}) does not have permission to (${requiredPermission.replaceAll("_", " ")}.)`
      });
    }

    next();
  };
}
