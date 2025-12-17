import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisService } from 'src/infra/databases/redis.service';
import { RefreshTokenStorage } from './refresh-token.storage';

@Injectable()
export class RefreshTokenRedisStorage implements RefreshTokenStorage {
  constructor(private readonly redisClient: RedisService) {}

  async insert(userId: string, tokenId: string): Promise<void> {
    const key = await this.getKey(userId);
    await this.redis().set(key, tokenId);
  }

  async validate(userId: string, tokenId: string): Promise<boolean> {
    const key = await this.getKey(userId);
    const storedId = await this.redis().get(key);
    return storedId === tokenId;
  }

  async invalidate(userId: string): Promise<void> {
    const key = await this.getKey(userId);
    await this.redis().del(key);
  }

  getKey(userId: string): Promise<string> {
    return Promise.resolve(`user-${userId}`);
  }

  private redis(): Redis {
    return this.redisClient.getClient();
  }
}
