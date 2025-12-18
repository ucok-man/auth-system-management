export enum PermissionAction {
  Create = 'create',
  Update = 'update',
  Read = 'read',
  Delete = 'delete',
}

export const SAFE_PERMISSIONS_ACTIONS = [
  PermissionAction.Create,
  PermissionAction.Update,
  PermissionAction.Read,
  PermissionAction.Delete,
] as const;
