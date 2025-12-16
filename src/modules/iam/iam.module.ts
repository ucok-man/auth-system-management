import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/databases/database.module';
import { AuhtenticationController } from './auhtentication/auhtentication.controller';
import { AuhtenticationService } from './auhtentication/auhtentication.service';
import { BcryptService } from './hashing/bcrypt.service';
import { HashingService } from './hashing/hashing.service';

@Module({
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    AuhtenticationService,
  ],
  controllers: [AuhtenticationController],
  imports: [DatabaseModule],
})
export class IamModule {}
