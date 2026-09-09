export const permissions = [
  "products:read",
  "products:create",
  "products:update",
  "products:delete",

  "orders:read",
  "orders:create",
  "orders:update",

  "users:read",
  "users:update",
] as const

export type Permission =
  (typeof permissions)[number]

  export const rolePermissions: Record<
  string,
  Permission[]
> = {
  ADMIN: [
    "products:read",
    "products:create",
    "products:update",
    "products:delete",

    "orders:read",
    "orders:create",
    "orders:update",

    "users:read",
    "users:update",
  ],

  CUSTOMER: [
    "products:read",
    "orders:read",
    "orders:create",
  ],
}

export function hasPermission(
  role: string,
  permission: Permission
) {
  return rolePermissions[role]?.includes(permission) ?? false
}