import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { IamModule } from './modules/iam/iam.module';
import { MenusModule } from './modules/menus/menus.module';
import { RolesModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.development', '.env.production'],
    }),
    UsersModule,
    IamModule,
    MenusModule,
    RolesModule,
  ],
  providers: [],
})
export class AppModule {}
