export type PermissionResolver<T = object> = (
  this: T
) => PermissionInput | readonly PermissionInput[]

export type PermissionInput = string | PermissionResolver
