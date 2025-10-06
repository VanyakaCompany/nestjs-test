import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CustomersModule } from './customers/customers.module';
import { validationSchema } from './config/validation';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `${process.cwd()}/src/config/.env.${process.env.NODE_ENV || 'development'}`,
            validationSchema,
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('MONGO_URI'),
            }),
        }),
        ScheduleModule.forRoot(),
        CustomersModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
