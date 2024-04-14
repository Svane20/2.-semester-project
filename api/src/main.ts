import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('NestJS - API')
    .setDescription('REST API for ESP32')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup('swagger/index.html', app, document);

  app.enableCors({
    origin: [process.env.PC_IP, 'http://localhost:4200', 'http://localhost'],
  });
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(5000);
}

bootstrap().then(() => {});
