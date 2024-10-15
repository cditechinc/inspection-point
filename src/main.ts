import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as session from 'express-session';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],  // Enable verbose logging
  });

  const configService = app.get(ConfigService);

  const allowedOrigins = configService.get<string>('CORS_ALLOWED_ORIGINS').split(',');

  app.use(
    session({
      secret: process.env.SESSION_SECRET, // Replace with your own secret key
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }, // Set to true if using HTTPS
    }),
  );

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

   // Apply global validation pipe
   app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true, // Optional
      forbidNonWhitelisted: true, // Optional
      forbidUnknownValues: true
    }),
  );

  // Apply global class serializer interceptor
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));


  await app.listen(3000);
}
bootstrap();
