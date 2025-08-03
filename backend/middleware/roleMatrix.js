export const rolePerms = {
  admin: [
    "view_users",
    "manage_users",
    "view_inventory",
    "view_logs",
    "edit_product",
    "edit_stock",
    "edit_order",
    "process_returns",
    "view_orders"
  ],
  manager: [
    "view_inventory",
    "view_users",
    "edit_product",
    "edit_stock",
    "edit_order",
    "process_returns",
    "view_orders",
    "view_logs"
  ],
  staff: [
    "view_inventory",
    "edit_product",
    "edit_product",
    "edit_stock",
    "edit_order",
    "process_returns",
    "edit_order",
    "process_returns",
    "view_orders"
  ]
};