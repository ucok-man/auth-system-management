import { SetMetadata } from '@nestjs/common';
import { RoutePermissionCode } from '../../permissions/route-permission-code.enum';

export const ROUTE_PERMISSION_KEY = 'routePermissions';
export const RoutePermission = (...routePermissions: RoutePermissionCode[]) =>
  SetMetadata(ROUTE_PERMISSION_KEY, routePermissions);
