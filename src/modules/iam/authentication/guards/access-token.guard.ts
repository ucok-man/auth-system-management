import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Permission } from 'src/generated/prisma/client';
import { PrismaService } from 'src/infra/databases/prisma.service';
import {
  REQUEST_PERMISSION_KEY,
  REQUEST_USER_KEY,
} from 'src/modules/iam/iam.constant';
import { ActiveUserPayload } from '../../interfaces/active-user-payload.interface';
import jwtConfig from '../config/jwt.config';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtCfg: ConfigType<typeof jwtConfig>,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Invalid or missing access token');
    }

    try {
      const payload: ActiveUserPayload = await this.jwtService.verifyAsync(
        token,
        this.jwtCfg,
      );

      const permissions = await this.prismaService.permission.findMany({
        where: {
          roles: {
            some: {
              id: payload.role.id,
            },
          },
        },
        select: {
          id: true,
          code: true,
          type: true,
        },
      });

      const groupedPermissions = permissions.reduce(
        (acc, permission) => {
          acc[permission.type.toLowerCase() + 's'].push(permission);
          return acc;
        },
        {
          routes: [] as Pick<Permission, 'id' | 'code' | 'type'>[],
          resources: [] as Pick<Permission, 'id' | 'code' | 'type'>[],
        },
      );

      request[REQUEST_PERMISSION_KEY] = groupedPermissions;
      request[REQUEST_USER_KEY] = payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or missing access token');
    }

    return true;
  }

  private extractToken(request: Request): string | undefined {
    const [_, token] = request.headers.authorization?.split(' ') ?? [];
    return token;
  }
}
