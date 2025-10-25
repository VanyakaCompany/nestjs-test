import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomersController } from './customers.controller';
import { ParserService } from './parser.service';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { CustomersService } from './customers.service';
import { ExternalService } from './external.service';
import { TasksService } from './tasks.service';
import { XmlContentTypeMiddleware } from './../common/middleware/xml.middleware';

@Module({
    imports: [MongooseModule.forFeature([{ name: Customer.name, schema: CustomerSchema }])],
    controllers: [CustomersController],
    providers: [ParserService, CustomersService, ExternalService, TasksService],
})
export class CustomersModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(XmlContentTypeMiddleware).forRoutes({ path: 'upload', method: RequestMethod.POST });
    }
}
