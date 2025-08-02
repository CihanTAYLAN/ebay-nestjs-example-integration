import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { StoplightElementsModule } from 'nestjs-stoplight-elements';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  // app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('eBay Integration API')
    .setDescription(
      'eBay store integration API for product management and order processing',
    )
    .setVersion('1.0')
    .addTag('eBay', 'eBay marketplace operations')
    .addBearerAuth()
    .addServer('http://localhost:3000', 'Development server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const StoplightElements = new StoplightElementsModule(app, document, {
    router: 'hash',
  });
  await StoplightElements.start('/docs');

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
