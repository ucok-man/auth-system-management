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
import { randomUUID } from 'crypto';
import { User } from 'src/generated/prisma/client';
import { PrismaService } from 'src/infra/databases/prisma.service';
import { HashingService } from '../hashing/hashing.service';
import { ActiveUserPayload } from '../interfaces/active-user.interface';
import { RefreshTokenPayload } from '../interfaces/refresh-token-payload';
import jwtConfig from './config/jwt.config';
import { RefreshTokenDto } from './dto/refresh-token.dto';
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

      const hash = await this.hashingService.hash(dto.password);
      const { password, isActive, ...user } = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hash,
          image: dto.image,
        },
      });
      return { user };
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
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const isEqual = await this.hashingService.compare(
        dto.password,
        user.password,
      );
      if (!isEqual) {
        throw new UnauthorizedException('Invalid email or password');
      }

      return await this.generateToken(user);
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to signup: ${error}`, error?.stack);
      throw new InternalServerErrorException();
    }
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

      const user = await this.prisma.user.findUnique({
        where: { id: sub },
      });
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token value');
      }
      return await this.generateToken(user);
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

  private async generateToken(user: User) {
    const refreshTokenId = randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserPayload>>(
        user.id,
        this.jwtCfg.accessTokenTtl,
        { email: user.email },
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
