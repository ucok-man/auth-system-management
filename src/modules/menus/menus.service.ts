import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/infra/databases/prisma.service';
import { ResourcePermissionPayload } from '../iam/interfaces/permission-payload.interface';
import { SAFE_PERMISSIONS_ACTIONS } from '../iam/permissions/permission-action.enum';
import { CreateMenuDto } from './dto/create-menu.dto';

@Injectable()
export class MenusService {
  private readonly logger = new Logger(MenusService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateMenuDto) {
    const existingMenu = await this.prismaService.menu.findUnique({
      where: { slug: dto.slug },
      select: { id: true },
    });

    if (existingMenu) {
      throw new BadRequestException([
        `slug menu with value "${dto.slug}" already exists`,
      ]);
    }

    if (dto.parentId) {
      const exist = await this.prismaService.menu.findUnique({
        where: { id: dto.parentId },
        select: { id: true },
      });

      if (!exist) {
        throw new BadRequestException([
          `parentId with value "${dto.parentId}" was not found`,
        ]);
      }
    }

    if (dto.resourcePermissions?.length) {
      for (const permission of dto.resourcePermissions) {
        const chunks = permission.split(':');
        if (chunks.length !== 2) {
          throw new BadRequestException([
            'resourcePermissions each item must be in format <rolecode>:<action> (lowercase)',
          ]);
        }

        const [rolecode, action] = chunks;
        if (!SAFE_PERMISSIONS_ACTIONS.includes(action as any)) {
          throw new BadRequestException([
            'resourcePermissions action must be one of create|read|update|delete (lowercase)',
          ]);
        }

        const exist = await this.prismaService.role.findUnique({
          where: {
            code: rolecode,
          },
        });

        if (!exist) {
          throw new BadRequestException([
            `resourcePermissions ${permission} has invalid on rolecode "${rolecode}" not found`,
          ]);
        }
      }
    }

    const { isActive, resourcePermissions, ...rest } =
      await this.prismaService.menu.create({
        data: {
          slug: dto.slug,
          name: dto.name,
          icon: dto.icon,
          href: dto.href,
          resourcePermissions: dto.resourcePermissions ?? [],
          parentId: dto.parentId,
        },
      });

    return { menu: rest };
  }

  async findMyMenus(param: { resourcePermissions: ResourcePermissionPayload }) {
    try {
      const permissionCodes = param.resourcePermissions.map((p) => p.code);

      const menus = await this.prismaService.menu.findMany({
        where: {
          OR: [
            { resourcePermissions: { isEmpty: true } },
            {
              resourcePermissions: {
                hasSome: permissionCodes,
              },
            },
          ],
          isActive: true,
        },
      });

      const cleaned = menus.map((m) => {
        const { isActive, resourcePermissions, ...rest } = m;
        return rest;
      });

      return { menus: cleaned };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to find all user menu: ${error}`, error?.stack);
      throw new InternalServerErrorException();
    }
  }
}
