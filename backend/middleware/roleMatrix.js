export const rolePerms = {
  admin: [
    "manage_users",
    "view_logs",
    "edit_product",
    "edit_stock",
    "edit_order",
    "process_returns",
    "view_orders"
  ],
  manager: [
    "manage_users",
    "edit_stock",
    "process_returns",
    "view_orders"
  ],
  staff: [
    "edit_stock",
    "view_orders"
  ],
  auditor: [
    "view_logs"
  ]
};
