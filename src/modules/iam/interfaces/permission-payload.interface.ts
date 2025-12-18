import { Permission } from 'src/generated/prisma/client';

export interface PermissionPayload {
  routes: Pick<Permission, 'id' | 'code' | 'type'>[];
  resources: Pick<Permission, 'id' | 'code' | 'type'>[];
}

export type ResourcePermissionPayload = PermissionPayload['resources'];
export type RoutePermissionPayload = PermissionPayload['routes'];
