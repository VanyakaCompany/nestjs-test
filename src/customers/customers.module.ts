import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomersController } from './customers.controller';
import { ParserService } from './parser.service';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { CustomersService } from './customers.service';
import { ExternalService } from './external.service';
import { TasksService } from './tasks.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: Customer.name, schema: CustomerSchema }])],
    controllers: [CustomersController],
    providers: [ParserService, CustomersService, ExternalService, TasksService],
})
export class CustomersModule { }
