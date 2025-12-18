import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/infra/databases/prisma.service';
import { REQUEST_PERMISSION_KEY } from '../../iam.constant';
import { PermissionPayload } from '../../interfaces/permission-payload.interface';
import { RoutePermissionCode } from '../../permissions/route-permission-code.enum';
import { ROUTE_PERMISSION_KEY } from '../decorators/permission.decorator';

@Injectable()
export class RoutePermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<
      RoutePermissionCode[]
    >(ROUTE_PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    // If no permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const permission: PermissionPayload = context.switchToHttp().getRequest()[
      REQUEST_PERMISSION_KEY
    ];

    const ownedPermissionRoutes = new Set(permission.routes.map((p) => p.code));
    const canAccess = requiredPermissions.every((permission) =>
      ownedPermissionRoutes.has(permission),
    );

    if (!canAccess) {
      throw new ForbiddenException(
        'You are not allowed to access this resources',
      );
    }

    return true;
  }
}
