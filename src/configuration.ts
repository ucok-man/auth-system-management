export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    dsn: process.env.DATABASE_URL,
  },
});
