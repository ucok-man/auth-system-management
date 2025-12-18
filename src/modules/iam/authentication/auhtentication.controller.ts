import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticationService } from './auhtentication.service';
import { Auth } from './decorators/auth.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SelectRoleDto } from './dto/select-role.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthType } from './enums/auth.type.enum';

@ApiTags('Authentication')
@Auth(AuthType.None)
@Controller('/auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/sign-up')
  @ApiOperation({
    summary: 'Register new user',
    description:
      'Create a new user account with specified roles. User must provide valid role codes that exist in the system.',
  })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    schema: {
      example: {
        data: {
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'John',
            email: 'john@example.com',
            image: 'https://example.com/avatar.jpg',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
          roles: [
            {
              id: '123e4567-e89b-12d3-a456-426614174001',
              code: 'admin',
              name: 'Administrator',
              description: 'System administrator',
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Email exists or invalid role codes',
    schema: {
      example: {
        statusCode: 400,
        message: ['email already exists'],
        error: 'Bad Request',
      },
    },
  })
  async signup(@Body() dto: SignUpDto) {
    const { user, roles } = await this.authService.signup(dto);
    return { data: { user, roles } };
  }

  @HttpCode(HttpStatus.OK)
  @Post('/sign-in')
  @ApiOperation({
    summary: 'User sign in',
    description: `
      Authenticate user with email and password.
      
      **Two possible responses:**
      1. **Single Role**: Returns access token and refresh token immediately
      2. **Multiple Roles**: Returns exchange token for role selection
    `,
  })
  @ApiBody({ type: SignInDto })
  @ApiResponse({
    status: 200,
    description: 'Sign in successful - Single role user',
    schema: {
      example: {
        data: {
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'John',
            email: 'john@example.com',
            image: 'https://example.com/avatar.jpg',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
          role: {
            id: '123e4567-e89b-12d3-a456-426614174001',
            code: 'admin',
            name: 'Administrator',
            description: 'System administrator',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        requireRoleSelection: false,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Sign in successful - Multiple roles (role selection required)',
    schema: {
      example: {
        data: {
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'John',
            email: 'john@example.com',
            image: 'https://example.com/avatar.jpg',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
          availableRoles: [
            {
              id: '123e4567-e89b-12d3-a456-426614174001',
              code: 'admin',
              name: 'Administrator',
            },
            {
              id: '123e4567-e89b-12d3-a456-426614174002',
              code: 'user',
              name: 'User',
            },
          ],
        },
        exchangeToken: 'a1b2c3d4e5f6...',
        exchangeTokenTTl: '2024-01-01T01:00:00.000Z',
        requireRoleSelection: true,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid email or password',
        error: 'Unauthorized',
      },
    },
  })
  async signin(@Body() dto: SignInDto) {
    const { requireRoleSelection, ...rest } =
      await this.authService.signin(dto);

    if (requireRoleSelection) {
      const { availableRoles, user, ...other } = rest;
      return {
        data: { user: user, availableRoles: availableRoles },
        requireRoleSelection: requireRoleSelection,
        ...other,
      };
    }

    const { role, user, ...other } = rest;
    return {
      data: { user: user, role: role },
      requireRoleSelection: requireRoleSelection,
      ...other,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('/select-role')
  @ApiOperation({
    summary: 'Select role after sign in',
    description:
      'For users with multiple roles, select one role to proceed. Requires exchange token from sign-in response.',
  })
  @ApiBody({ type: SelectRoleDto })
  @ApiResponse({
    status: 200,
    description: 'Role selected successfully',
    schema: {
      example: {
        data: {
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'John',
            email: 'john@example.com',
            image: 'https://example.com/avatar.jpg',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
          role: {
            id: '123e4567-e89b-12d3-a456-426614174001',
            code: 'admin',
            name: 'Administrator',
            description: 'System administrator',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        requireRoleSelection: false,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid or expired exchange token',
    schema: {
      example: {
        statusCode: 400,
        message: ['exchangeToken value is invalid or expired'],
        error: 'Bad Request',
      },
    },
  })
  async selectRole(@Body() dto: SelectRoleDto) {
    const { user, role, ...rest } = await this.authService.selectRole(dto);
    return { data: { user, role }, ...rest };
  }

  @HttpCode(HttpStatus.OK)
  @Post('/refresh-tokens')
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Generate new access token and refresh token using valid refresh token.',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired refresh token',
    schema: {
      example: {
        statusCode: 401,
        message: ['refreshToken is invalid or expired'],
        error: 'Unauthorized',
      },
    },
  })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    const { accessToken, refreshToken } =
      await this.authService.refreshToken(dto);

    return { accessToken, refreshToken };
  }
}
