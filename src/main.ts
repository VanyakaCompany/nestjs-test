import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    app.use(bodyParser.text({ type: 'application/xml' }));
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

    await app.listen(configService.get<number>('PORT')!);
}
bootstrap();
