import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoutePermission } from '../iam/authorization/decorators/permission.decorator';
import { RoutePermissionCode } from '../iam/permissions/route-permission-code.enum';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @RoutePermission(RoutePermissionCode.UserRead)
  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description:
      'Retrieve list of all users in the system. Requires "user:read" permission.',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'John',
            email: 'john@example.com',
            image: 'https://example.com/avatar.jpg',
            password: '$2b$10$...',
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
    const { users } = await this.usersService.findAll();
    return { data: users };
  }
}
