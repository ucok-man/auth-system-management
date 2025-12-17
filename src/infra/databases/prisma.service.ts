import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'src/generated/prisma/client';
import postgresConfig from './config/postgres.config';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(
    @Inject(postgresConfig.KEY)
    private readonly pgCfg: ConfigType<typeof postgresConfig>,
  ) {
    const adapter = new PrismaPg({
      connectionString: pgCfg.dsn,
      max: pgCfg.maxOpenConn, // equivalent to SetMaxOpenConns - maximum pool size
      min: pgCfg.minIdleConn, // minimum pool size (idle connections kept alive)
      idleTimeoutMillis: pgCfg.maxIdleTimeSecond * 1000, // equivalent to SetConnMaxIdleTime
      connectionTimeoutMillis: pgCfg.maxConnTimeoutSecond * 1000, // timeout when acquiring connection from pool
    });
    super({ adapter });
  }
}
