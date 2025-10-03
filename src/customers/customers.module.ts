import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomersController } from './customers.controller';
import { ParserService } from './parser.service';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { CustomersService } from './customers.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Customer.name, schema: CustomerSchema }])],
  controllers: [CustomersController],
  providers: [ParserService, CustomersService],
})
export class CustomersModule {}
