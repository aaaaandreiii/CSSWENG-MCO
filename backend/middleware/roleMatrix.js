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
    "view_orders",
    "view_logs",
    "edit_product",
    "edit_stock",
    "edit_order",
    "process_returns",
    "view_orders"
  ],
  staff: [
    "edit_product",
    "edit_stock",
    "edit_order",
    "process_returns",
    "view_orders"
  ]
};