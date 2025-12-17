import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/postgres.config';
import redisConfig from './config/redis.config';
import { PrismaService } from './prisma.service';
import { RedisService } from './redis.service';

@Module({
  providers: [PrismaService, RedisService],
  exports: [PrismaService, RedisService],
  imports: [
    ConfigModule.forFeature(databaseConfig),
    ConfigModule.forFeature(redisConfig),
  ],
})
export class DatabaseModule {}
