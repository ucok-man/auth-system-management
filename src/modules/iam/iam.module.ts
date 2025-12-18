import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/infra/databases/database.module';
import { AuthenticationController } from './authentication/auhtentication.controller';
import { AuthenticationService } from './authentication/auhtentication.service';
import jwtConfig from './authentication/config/jwt.config';
import { AccessTokenGuard } from './authentication/guards/access-token.guard';
import { AuthenticationGuard } from './authentication/guards/authentication.guard';
import { RefreshTokenRedisStorage } from './authentication/storages/refresh-token.redis.storage';
import { RefreshTokenStorage } from './authentication/storages/refresh-token.storage';
import { RoutePermissionGuard } from './authorization/guards/route-permission.guard';
import { BcryptService } from './hashing/bcrypt.service';
import { HashingService } from './hashing/hashing.service';

@Module({
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    {
      provide: RefreshTokenStorage,
      useClass: RefreshTokenRedisStorage,
    },
    {
      provide: APP_GUARD, // GLOBAL
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD, // GLOBAL
      useClass: RoutePermissionGuard,
    },
    AccessTokenGuard,
    AuthenticationService,
  ],
  controllers: [AuthenticationController],
  imports: [
    DatabaseModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],
})
export class IamModule {}
