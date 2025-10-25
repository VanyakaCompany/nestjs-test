import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { ParserService } from './parser.service';
import { CustomersService } from './customers.service';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { CustomerDto } from './dto/customers.dto';
import { isMongoError, isValidationErrorArray } from '../common/errors/error-guards';
import { extractValidationMessages } from '../common/errors/error.utils';

@Controller()
export class CustomersController {
    constructor(
        private readonly customersService: CustomersService,
        private readonly parserService: ParserService,
    ) {}

    @Get('customers')
    async findAll(@Query() pagination: PaginationQueryDto) {
        const { page, limit } = pagination;
        return this.customersService.findAllWithPagination(page, limit);
    }

    @Post('upload')
    async upload(@Body() rawXml: string = '') {
        const parsed = this.parserService.parseSafe(rawXml);

        const added: any[] = [];
        const invalid: any[] = [];
        const duplicated: any[] = [];
        const failed: any[] = [];

        for (const customer of parsed.customers.customer) {
            const customerDto = plainToInstance(CustomerDto, customer);

            try {
                await validateOrReject(customerDto, { whitelist: true });
                added.push(await this.customersService.create(customerDto));
            } catch (err) {
                if (isMongoError(err) && err.code === 11000) {
                    duplicated.push(customerDto);
                } else if (isValidationErrorArray(err)) {
                    invalid.push({ ...customerDto, reason: extractValidationMessages(err) });
                } else {
                    failed.push(customerDto);
                }
            }
        }

        return { added, invalid, duplicated, failed };
    }
}
