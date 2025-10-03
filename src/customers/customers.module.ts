import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { ParserService } from './parser.service';

@Module({
  controllers: [CustomersController],
  providers: [ParserService],
})
export class CustomersModule {}
