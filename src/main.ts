import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from './config/app.config';
import { LoggerService } from './common/services/logger.service';
import helmet from 'helmet';
import * as mongoose from 'mongoose';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
  // origin should be limited to allowed hosts only
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Enable query sanitization to prevent NoSQL injection
  mongoose.set('sanitizeFilter', true);

  // Secure HTTP headers
  app.use(helmet());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('API documentation for authentication app')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Enable validations
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: false,
    }),
  );


  // Load configuration
  const configService = app.get(ConfigService);
  const config = configService.get<Config>('Config');

  const logger = app.get(LoggerService);

  // Log unhandled rejection events
  process.on('unhandledRejection', async (error: any) => {
    logger.error('Unhandled rejection', error);
    process.exit(1); // Exit for a restart by supervisor
  });

  // Log uncaught exception events
  process.on('uncaughtException', async (error: any) => {
    logger.error('Uncaught exception', error);
    process.exit(1); // Exit for a restart by supervisor
  });

  // Start app
  await app
    .listen(config?.Server.Port ?? 3001, config?.Server.Host ?? '127.0.0.1')
    .then(async () => {
      const url = await app.getUrl();
      console.log(`Server  running on ${url}`);
      console.log(`Swagger running on ${url}/api/docs`);
    });
}
bootstrap();
