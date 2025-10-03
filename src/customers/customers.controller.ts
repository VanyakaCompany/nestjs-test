import { Controller, Get, Post, Query, Body, UsePipes } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { ParserService } from './parser.service';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { PaginationPipe } from '../common/pipes/pagination.pipe';
import { handleValidationErrors } from '../common/helpers/validation.helper';

@Controller()
export class CustomersController {
    constructor(
        private readonly customersService: CustomersService,
        private readonly parserService: ParserService,
    ) {}

    @Get('customers')
    @UsePipes(PaginationPipe)
    async findAll(@Query() query: { page: number; limit: number }) {
        const { page, limit } = query;
        return this.customersService.findAllWithPagination(page, limit);
    }

    @Post('upload')
    async upload(@Body() rawXml: string) {
        const parsed = this.parserService.parseSafe(rawXml);

        for (const customer of parsed.customers.customer) {
            const createCustomerDto = plainToInstance(CreateCustomerDto, customer);
            try {
                await validateOrReject(createCustomerDto);
            } catch (errors) {
                handleValidationErrors(errors);
            }
            await this.customersService.create(createCustomerDto)
        }

        return { parsed };
    }
}
