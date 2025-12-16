import { Module } from '@nestjs/common';

import { CoffeesModule } from './coffees/coffees.module';
import { PrismaService } from './prisma.service';
import { UsersModule } from './users/users.module';
import { IamModule } from './iam/iam.module';

@Module({
  imports: [CoffeesModule, UsersModule, IamModule],
  providers: [PrismaService],
})
export class AppModule {}
