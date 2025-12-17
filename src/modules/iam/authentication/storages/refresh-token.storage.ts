import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class RefreshTokenStorage {
  abstract insert(userId: string, tokenId: string): Promise<void>;
  abstract validate(userId: string, tokenId: string): Promise<boolean>;
  abstract invalidate(userId: string): Promise<void>;
  abstract getKey(userId: string): Promise<string>;
}
