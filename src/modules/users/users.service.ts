import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/infra/databases/prisma.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    const users = await this.prismaService.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { users };
  }
}
