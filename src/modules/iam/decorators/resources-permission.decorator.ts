import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REQUEST_PERMISSION_KEY } from '../iam.constant';
import { PermissionPayload } from '../interfaces/permission-payload.interface';

export const ResourcePermissions = createParamDecorator(
  (field: undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const permission: PermissionPayload = request[REQUEST_PERMISSION_KEY];
    return permission.resources;
  },
);
