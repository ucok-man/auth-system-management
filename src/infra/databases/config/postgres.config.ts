import { registerAs } from '@nestjs/config';

export default registerAs('postgres', () => {
  return {
    dsn: process.env.POSTGRES_URL,
    maxOpenConn: parseInt(process.env.POSTGRES_MAX_OPEN_CONN ?? '25', 10),
    minIdleConn: parseInt(process.env.POSTGRES_MIN_IDLE_CONN ?? '15', 10),
    maxIdleTimeSecond: parseInt(
      process.env.POSTGRES_MAX_IDLE_TIME_SECOND ?? '900', // 15m
      10,
    ),
    maxConnTimeoutSecond: parseInt(
      process.env.POSTGRES_MAX_CONN_TIMEOUT_SECOND ?? '3',
      10,
    ),
  };
});
