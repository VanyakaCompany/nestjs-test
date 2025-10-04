import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    app.use(bodyParser.text({ type: 'application/xml' }));

    await app.listen(configService.get<number>('PORT') as number);
}
bootstrap();
