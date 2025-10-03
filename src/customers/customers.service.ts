import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Customer } from './schemas/customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
    constructor(@InjectModel(Customer.name) private customerModel: Model<Customer>) {}

    async findAllWithPagination(page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            this.customerModel.find().skip(skip).limit(limit).exec(),
            this.customerModel.countDocuments().exec(),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages,
            },
        };
    }

    async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
        const createdCustomer = new this.customerModel(createCustomerDto);
        return createdCustomer.save();
    }
}
