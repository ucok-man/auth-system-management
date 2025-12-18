import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoutePermission } from '../iam/authorization/decorators/permission.decorator';
import { RoutePermissionCode } from '../iam/permissions/route-permission-code.enum';
import { AssignRoleDto } from './dto/assign-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesService } from './roles.service';

@ApiTags('Roles')
@ApiBearerAuth('JWT-auth')
@Controller('/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @RoutePermission(RoutePermissionCode.RoleCreate)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiOperation({
    summary: 'Create new role',
    description:
      'Create a new role in the system. Requires "role:create" permission.',
  })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    schema: {
      example: {
        data: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          code: 'admin',
          name: 'Administrator',
          description: 'System administrator',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Role code already exists',
    schema: {
      example: {
        statusCode: 400,
        message: ["code with value 'admin' already exists"],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid access token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have required permission',
  })
  async create(@Body() dto: CreateRoleDto) {
    const { role } = await this.rolesService.create(dto);
    return { data: role };
  }

  @RoutePermission(RoutePermissionCode.RoleEdit)
  @HttpCode(HttpStatus.OK)
  @Post('/assign')
  @ApiOperation({
    summary: 'Assign role to user',
    description:
      'Assign an existing role to a user. Requires "role:edit" permission.',
  })
  @ApiBody({ type: AssignRoleDto })
  @ApiResponse({
    status: 200,
    description: 'Role assigned successfully',
    schema: {
      example: {
        data: {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          assignedRole: {
            id: '123e4567-e89b-12d3-a456-426614174001',
            code: 'admin',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - User or role not found, or role already assigned',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'userId has this role 123e4567-e89b-12d3-a456-426614174001 assigned',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid access token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have required permission',
  })
  async assignRole(@Body() dto: AssignRoleDto) {
    const { assignedRole, userId } = await this.rolesService.assignRole(dto);
    return { data: { assignedRole, userId } };
  }

  @RoutePermission(RoutePermissionCode.RoleRead)
  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiOperation({
    summary: 'Get all roles',
    description:
      'Retrieve list of all roles in the system. Requires "role:read" permission.',
  })
  @ApiResponse({
    status: 200,
    description: 'Roles retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            code: 'admin',
            name: 'Administrator',
            description: 'System administrator',
            isActive: true,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid access token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have required permission',
  })
  async findAll() {
    const { roles } = await this.rolesService.findAll();
    return { data: roles };
  }
}
