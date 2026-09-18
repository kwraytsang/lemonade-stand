import { writeFileSync } from 'fs';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('Lemonade Stand API')
    .setDescription(
      'Beverage management and order processing for the lemonade stand app',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  writeFileSync('openapi.json', JSON.stringify(document, null, 2));

  await app.close();
}

generate();
