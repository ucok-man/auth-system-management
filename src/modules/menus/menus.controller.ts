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
import { ResourcePermissions } from '../iam/decorators/resources-permission.decorator';
import type { ResourcePermissionPayload } from '../iam/interfaces/permission-payload.interface';
import { RoutePermissionCode } from '../iam/permissions/route-permission-code.enum';
import { CreateMenuDto } from './dto/create-menu.dto';
import { MenusService } from './menus.service';

@ApiTags('Menus')
@ApiBearerAuth('JWT-auth')
@Controller('/menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @HttpCode(HttpStatus.CREATED)
  @RoutePermission(RoutePermissionCode.MenuCreate)
  @Post()
  @ApiOperation({
    summary: 'Create new menu',
    description: `
      Create a new menu item. Requires "menu:create" permission.
      
      **Resource Permissions:** Array of permissions required to access this menu (format: <rolecode>:<action>)
      - If empty, menu is accessible to all authenticated users
      - If specified, only users with matching resource permissions can see this menu
    `,
  })
  @ApiBody({ type: CreateMenuDto })
  @ApiResponse({
    status: 201,
    description: 'Menu created successfully',
    schema: {
      example: {
        data: {
          id: '123e4567-e89b-12d3-a456-426614174003',
          slug: 'dashboard',
          name: 'Dashboard',
          icon: 'dashboard-icon',
          href: 'https://example.com/dashboard',
          parentId: null,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or slug already exists',
    schema: {
      example: {
        statusCode: 400,
        message: ['slug menu with value "dashboard" already exists'],
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
  async create(@Body() dto: CreateMenuDto) {
    const { menu } = await this.menusService.create(dto);
    return { data: menu };
  }

  @HttpCode(HttpStatus.OK)
  @RoutePermission(RoutePermissionCode.MenuRead)
  @Get('/my-menus')
  @ApiOperation({
    summary: 'Get user menus',
    description: `
      Retrieve menus accessible to the current user based on their resource permissions.
      Requires "menu:read" permission.
      
      **Returns:**
      - Menus with no resource permissions (public menus)
      - Menus where user has matching resource permissions
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Menus retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174003',
            slug: 'dashboard',
            name: 'Dashboard',
            icon: 'dashboard-icon',
            href: 'https://example.com/dashboard',
            parentId: null,
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
  async myMenus(
    @ResourcePermissions() resourcePermissions: ResourcePermissionPayload,
  ) {
    const { menus } = await this.menusService.findMyMenus({
      resourcePermissions: resourcePermissions,
    });
    return { data: menus };
  }
}
