import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import Redis from 'ioredis';
import redisConfig from './config/redis.config';

@Injectable()
export class RedisService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private redisClient: Redis;

  constructor(
    @Inject(redisConfig.KEY)
    private readonly redisCfg: ConfigType<typeof redisConfig>,
  ) {}

  onApplicationBootstrap() {
    this.redisClient = new Redis({
      host: this.redisCfg.host,
      port: this.redisCfg.port,
    });
  }
  onApplicationShutdown(signal?: string) {
    this.redisClient?.quit();
  }

  getClient(): Redis {
    return this.redisClient;
  }
}
