import { Model, FilterQuery, SortOrder, UpdateQuery } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Customer } from './schemas/customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
    constructor(@InjectModel(Customer.name) private customerModel: Model<Customer>) { }

    async findAllWithPagination(page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [customers, total] = await Promise.all([
            this.customerModel.find().skip(skip).limit(limit).exec(),
            this.customerModel.countDocuments().exec(),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: customers,
            meta: {
                total,
                page,
                limit,
                totalPages,
            },
        };
    }

    async findOne(
        filter: FilterQuery<Customer>,
        options?: {
            excludeFields?: (keyof Customer)[],
            projection?: Record<string, 0 | 1>,
            sort?: Record<string, SortOrder>
        }
    ): Promise<Customer | null> {
        const query: FilterQuery<Customer> = { ...filter };

        if (options?.excludeFields?.length) {
            options.excludeFields.forEach(field => {
                query[field] = { $exists: false };
            });
        }

        let mongoQuery = this.customerModel.findOne(query);

        if (options?.projection) {
            mongoQuery = mongoQuery.select(options.projection);
        }

        if (options?.sort) {
            mongoQuery = mongoQuery.sort(options.sort);
        }

        return mongoQuery.exec();
    }

    async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
        const createdCustomer = new this.customerModel(createCustomerDto);
        return createdCustomer.save();
    }

    async updateOne(filter: FilterQuery<Customer>, update: UpdateQuery<Customer>): Promise<Customer | null> {
        return this.customerModel.findOneAndUpdate(filter, update, { new: true }).exec();
    }
}
