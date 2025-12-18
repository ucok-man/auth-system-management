import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/infra/databases/prisma.service';
import { SAFE_PERMISSIONS_ACTIONS } from '../iam/permissions/permission-action.enum';
import { RolesService } from '../roles/roles.service';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(RolesService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreatePermissionDto) {
    try {
      const exist = await this.prismaService.permission.findUnique({
        where: { code: dto.code },
      });

      if (exist) {
        throw new BadRequestException([
          `code with value '${dto.code}' already exists`,
        ]);
      }

      const chunks = dto.code.split(':');
      if (chunks.length !== 2) {
        throw new BadRequestException([
          'code must be in format <rolecode>:<action> (lowercase)',
        ]);
      }

      const [rolecode, action] = chunks;
      if (!SAFE_PERMISSIONS_ACTIONS.includes(action as any)) {
        throw new BadRequestException([
          'code action must be one of create|read|update|delete (lowercase)',
        ]);
      }

      const roleExist = await this.prismaService.role.findUnique({
        where: {
          code: rolecode,
        },
      });

      if (!roleExist) {
        throw new BadRequestException([
          `code ${dto.code} has invalid rolecode "${rolecode}" not found`,
        ]);
      }

      const { isActive, ...rest } = await this.prismaService.permission.create({
        data: {
          code: dto.code,
          name: dto.name,
          description: dto.description,
          type: 'Resource',
        },
      });

      return { permission: rest };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to create permission: ${error}`, error?.stack);
      throw new InternalServerErrorException();
    }
  }

  async assignPermission(dto: AssignPermissionDto) {
    try {
      const permission = await this.prismaService.permission.findUnique({
        where: { id: dto.roleId, isActive: true },
        include: { roles: true },
      });

      if (!permission) {
        throw new BadRequestException([
          `permissionId with value '${dto.permissionId}' not found`,
        ]);
      }

      const role = await this.prismaService.role.findUnique({
        where: { id: dto.roleId, isActive: true },
        select: { id: true, code: true },
      });

      if (!role) {
        throw new BadRequestException([
          `roleId with value '${dto.roleId}' not found`,
        ]);
      }

      const hasPermisssion = permission.roles.find((r) => r.code === role.code);
      if (hasPermisssion) {
        throw new BadRequestException([
          `roleId has already this permission ${dto.permissionId} assigned`,
        ]);
      }

      const updatedPermission = await this.prismaService.permission.update({
        where: { id: permission.id },
        data: {
          roles: {
            connect: { id: role.id },
          },
        },
        select: { id: true, code: true },
      });

      return {
        roleId: role.id,
        assignedPermission: updatedPermission,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to assigning role: ${error}`, error?.stack);
      throw new InternalServerErrorException();
    }
  }

  async findAll() {
    try {
      const permissions = await this.prismaService.permission.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return { permissions };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to fetch all role: ${error}`, error?.stack);
      throw new InternalServerErrorException();
    }
  }
}
