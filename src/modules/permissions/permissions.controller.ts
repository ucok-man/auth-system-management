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
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PermissionsService } from './permissions.service';

@ApiTags('Permissions')
@ApiBearerAuth('JWT-auth')
@Controller('/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @RoutePermission(RoutePermissionCode.PermissionCreate)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiOperation({
    summary: 'Create new permission',
    description: `
      Create a new resource permission in the system. Requires "permission:create" permission.
      
      **Permission Code Format:** \`<rolecode>:<action>\`
      - Actions: create, read, update, delete
      - Example: user:read, admin:create
    `,
  })
  @ApiBody({ type: CreatePermissionDto })
  @ApiResponse({
    status: 201,
    description: 'Permission created successfully',
    schema: {
      example: {
        data: {
          id: '123e4567-e89b-12d3-a456-426614174002',
          code: 'user:read',
          name: 'Read Users',
          description: 'Allows viewing user data',
          type: 'Resource',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid format or permission already exists',
    schema: {
      example: {
        statusCode: 400,
        message: ["code with value 'user:read' already exists"],
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
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    const { permission } =
      await this.permissionsService.create(createPermissionDto);
    return { data: permission };
  }

  @RoutePermission(RoutePermissionCode.PermissionEdit)
  @HttpCode(HttpStatus.OK)
  @Post('/assign')
  @ApiOperation({
    summary: 'Assign permission to role',
    description:
      'Assign an existing permission to a role. Requires "permission:edit" permission.',
  })
  @ApiBody({ type: AssignPermissionDto })
  @ApiResponse({
    status: 200,
    description: 'Permission assigned successfully',
    schema: {
      example: {
        data: {
          roleId: '123e4567-e89b-12d3-a456-426614174001',
          assignedPermission: {
            id: '123e4567-e89b-12d3-a456-426614174002',
            code: 'user:read',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - Role or permission not found, or already assigned',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'roleId has already this permission 123e4567-e89b-12d3-a456-426614174002 assigned',
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
  async assing(@Body() dto: AssignPermissionDto) {
    const { roleId, assignedPermission } =
      await this.permissionsService.assignPermission(dto);

    return { data: { roleId, assignedPermission } };
  }

  @RoutePermission(RoutePermissionCode.PermissionRead)
  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiOperation({
    summary: 'Get all permissions',
    description:
      'Retrieve list of all permissions in the system. Requires "permission:read" permission.',
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174002',
            code: 'user:read',
            name: 'Read Users',
            description: 'Allows viewing user data',
            type: 'Resource',
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
    const { permissions } = await this.permissionsService.findAll();
    return { data: permissions };
  }
}
