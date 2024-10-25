import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = process.env.API_PREFIX || 'api';
  app.setGlobalPrefix(globalPrefix);

  const PORT = process.env.PORT ?? 3000;

  await app.listen(PORT);

  console.log(
    `Application is running on: http://localhost:${PORT}/${globalPrefix}`,
  );
}
bootstrap();
