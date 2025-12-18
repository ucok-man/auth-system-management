import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/infra/databases/prisma.service';
import { AssignRoleDto } from './dto/assign-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateRoleDto) {
    try {
      const exist = await this.prismaService.role.findUnique({
        where: { code: dto.code },
      });

      if (exist) {
        throw new BadRequestException([
          `Code with value '${dto.code}' already exists`,
        ]);
      }

      const { isActive, ...rest } = await this.prismaService.role.create({
        data: {
          code: dto.code,
          name: dto.name,
          description: dto.description,
        },
      });

      return { role: rest };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to create role: ${error}`, error?.stack);
      throw new InternalServerErrorException();
    }
  }

  async assignRole(dto: AssignRoleDto) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: dto.userId, isActive: true },
        include: { roles: true },
      });

      if (!user) {
        throw new BadRequestException([
          `UserId with value '${dto.userId}' not found`,
        ]);
      }

      const role = await this.prismaService.role.findUnique({
        where: { id: dto.roleId, isActive: true },
        select: { id: true, code: true },
      });

      if (!role) {
        throw new BadRequestException([
          `RoleId with value '${dto.roleId}' not found`,
        ]);
      }

      // Check if user already has this role
      const hasRole = user.roles.some((r) => r.id === dto.roleId);
      if (hasRole) {
        throw new BadRequestException('User already has this role assigned');
      }

      // Assign role to user using the many-to-many relation
      const updatedUser = await this.prismaService.user.update({
        where: { id: dto.userId },
        data: {
          roles: {
            connect: { id: dto.roleId },
          },
        },
        include: {
          roles: {
            select: {
              id: true,
              code: true,
            },
          },
        },
      });

      return {
        userId: user.id,
        assignedRole: role,
        allRoles: updatedUser.roles,
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
      const roles = await this.prismaService.role.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return { roles };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to fetch all role: ${error}`, error?.stack);
      throw new InternalServerErrorException();
    }
  }
}
