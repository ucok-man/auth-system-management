import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { Role, User } from 'src/generated/prisma/client';
import { PrismaService } from 'src/infra/databases/prisma.service';
import { HashingService } from '../hashing/hashing.service';
import { ActiveUserPayload } from '../interfaces/active-user-payload.interface';
import { RefreshTokenPayload } from '../interfaces/refresh-token-payload';
import jwtConfig from './config/jwt.config';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SelectRoleDto } from './dto/select-role.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { RefreshTokenStorage } from './storages/refresh-token.storage';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenStorage: RefreshTokenStorage,
    @Inject(jwtConfig.KEY)
    private readonly jwtCfg: ConfigType<typeof jwtConfig>,
  ) {}

  async signup(dto: SignUpDto) {
    try {
      const exist = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (exist) {
        throw new BadRequestException(['Email already exists']);
      }

      // Validate role codes
      const rolecodes = await this.prisma.role.findMany({
        where: {
          code: {
            in: dto.roleCodes,
          },
          isActive: true,
        },
        select: {
          code: true,
        },
      });

      const validRoleCodes = rolecodes.map((r) => r.code);
      const invalidRoleCodes = dto.roleCodes.filter(
        (code) => !validRoleCodes.includes(code),
      );

      if (invalidRoleCodes.length > 0) {
        throw new BadRequestException(
          invalidRoleCodes.map((code) => `Role code ${code} is not valid`),
        );
      }

      const hash = await this.hashingService.hash(dto.password);

      // Remove unnecessary field
      const { password, isActive, roles, ...userRest } =
        await this.prisma.user.create({
          data: {
            name: dto.name,
            email: dto.email,
            password: hash,
            image: dto.image,
            roles: {
              connect: validRoleCodes.map((c) => ({ code: c })),
            },
          },
          include: {
            roles: true,
          },
        });

      const roleRest = roles.map((role) => {
        const { isActive, ...roleRest } = role;
        return roleRest;
      });

      return {
        user: userRest,
        roles: roleRest,
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to signup: ${error}`, error?.stack);
      throw new InternalServerErrorException();
    }
  }

  async signin(dto: SignInDto) {
    try {
      const exist = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
        include: {
          roles: true,
        },
      });

      if (!exist) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const { roles, ...user } = exist;
      if (!roles.length) {
        this.logger.error(`Signup user found but has no role included`);
        throw new InternalServerErrorException();
      }

      const isEqual = await this.hashingService.compare(
        dto.password,
        user.password,
      );
      if (!isEqual) {
        throw new UnauthorizedException('Invalid email or password');
      }

      if (roles.length > 1) {
        const oneHour = 60 * 60 * 1000;
        const { token, expiredAt } = await this.generateExchangeToken(
          oneHour,
          user,
        );

        // Remove unnecessary field
        const { password, isActive, ...userRest } = user;
        const roleRest = roles.map((role) => {
          const { isActive, ...roleRest } = role;
          return roleRest;
        });

        return {
          user: userRest,
          availableRoles: roleRest,
          exchangeToken: token,
          exchangeTokenTTl: expiredAt,
          requireRoleSelection: true,
        } as const;
      }

      const selectedRole = roles[0];
      const { accessToken, refreshToken } = await this.generateJWTToken(
        user,
        selectedRole,
      );

      // Remove unnecessary field
      const { password, isActive: isActiveUser, ...userRest } = user;
      const { isActive: isActiveRole, ...roleRest } = selectedRole;

      return {
        user: userRest,
        role: roleRest,
        accessToken: accessToken,
        refreshToken: refreshToken,
        requireRoleSelection: false,
      } as const;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to signup: ${error}`, error?.stack);
      throw new InternalServerErrorException();
    }
  }

  async selectRole(dto: SelectRoleDto) {
    const { isValid, userId } = await this.verifyExchangeToken(
      dto.exchangeToken,
    );
    if (!isValid) {
      throw new BadRequestException([
        'ExchangeToken value are invalid or expired',
      ]);
    }

    const exist = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        roles: true,
      },
    });

    if (!exist) {
      this.logger.error(
        `Select role token exhange are valid but user not found`,
      );
      throw new InternalServerErrorException();
    }

    const { roles, ...user } = exist;
    if (!roles.length) {
      this.logger.error(`Select role user found but has no role included`);
      throw new InternalServerErrorException();
    }

    const selectedRole = roles.find((r) => r.id === dto.roleId);
    if (!selectedRole) {
      throw new BadRequestException(['RoleId value are invalid']);
    }

    const { accessToken, refreshToken } = await this.generateJWTToken(
      user,
      selectedRole,
    );

    await this.prisma.verification.deleteMany({
      where: { userId: user.id, scope: 'SelectRole' },
    });

    // Remove unnecessary field
    const { password, isActive: isActiveUser, ...userRest } = user;
    const { isActive: isActiveRole, ...roleRest } = selectedRole;

    return {
      user: userRest,
      role: roleRest,
      accessToken: accessToken,
      refreshToken: refreshToken,
      requireRoleSelection: false as const,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const { sub, refreshTokenId } =
        await this.jwtService.verifyAsync<RefreshTokenPayload>(
          dto.refreshToken,
          {
            secret: this.jwtCfg.secret,
            audience: this.jwtCfg.audience,
            issuer: this.jwtCfg.issuer,
          },
        );

      const isRefreshTokenValid = await this.refreshTokenStorage.validate(
        sub,
        refreshTokenId,
      );
      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token value');
      } else {
        await this.refreshTokenStorage.invalidate(sub);
      }

      const exist = await this.prisma.user.findUnique({
        where: { id: sub },
        include: {
          roles: true,
        },
      });
      if (!exist) {
        throw new UnauthorizedException('Invalid refresh token value');
      }

      const { roles, ...user } = exist;
      if (!roles.length) {
        this.logger.error(`Refresh token user found but has no role included`);
        throw new InternalServerErrorException();
      }

      return await this.generateJWTToken(user, roles[0]);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        `Failed to generate new refresh token: ${error}`,
        error?.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  private async generateJWTToken(user: User, role: Role) {
    const refreshTokenId = randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserPayload>>(
        user.id,
        this.jwtCfg.accessTokenTtl,
        {
          user: {
            id: user.id,
            email: user.email,
          },
          role: {
            id: role.id,
            code: role.code,
          },
        },
      ),
      this.signToken<Partial<RefreshTokenPayload>>(
        user.id,
        this.jwtCfg.refershTokenTtl,
        {
          refreshTokenId,
        },
      ),
    ]);
    await this.refreshTokenStorage.insert(user.id, refreshTokenId);
    return { accessToken, refreshToken };
  }

  private async generateExchangeToken(ttlMs: number, user: User) {
    const plaintext = randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + ttlMs);
    const hash = createHash('sha256').update(plaintext).digest('hex');

    await this.prisma.verification.create({
      data: {
        value: hash,
        expiredAt: expiry,
        scope: 'SelectRole',
        userId: user.id,
      },
    });

    return {
      token: plaintext,
      expiredAt: expiry,
    };
  }

  async verifyExchangeToken(token: string) {
    const hash = createHash('sha256').update(token).digest('hex');
    const verification = await this.prisma.verification.findUnique({
      where: {
        value: hash,
        expiredAt: {
          gt: new Date(), // not expired
        },
        scope: 'SelectRole',
      },
    });

    if (!verification) {
      return {
        isValid: false,
        userId: null,
      } as const;
    }

    return { isValid: true, userId: verification.userId } as const;
  }

  private async signToken<T>(userId: string, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtCfg.audience,
        issuer: this.jwtCfg.issuer,
        secret: this.jwtCfg.secret,
        expiresIn: expiresIn,
      },
    );
  }
}
