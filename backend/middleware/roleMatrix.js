export const rolePerms = {
  admin: [
    "view_users",
    "manage_users",
    "view_logs",
    "edit_product",
    "edit_stock",
    "edit_order",
    "process_returns",
    "view_orders"
  ],
  manager: [
    "view_users",
    "edit_product",
    "edit_stock",
    "edit_order",
    "process_returns",
    "view_orders",
    "view_logs"
  ],
  staff: [
    "edit_product",
    "edit_stock",
    "edit_order",
    "process_returns",
    "view_orders"
  ]
};
