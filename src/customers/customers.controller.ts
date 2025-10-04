import { Controller, Get, Post, Query, Body, UsePipes } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { ParserService } from './parser.service';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { PaginationPipe } from '../common/pipes/pagination.pipe';

@Controller()
export class CustomersController {
    constructor(
        private readonly customersService: CustomersService,
        private readonly parserService: ParserService,
    ) { }

    @Get('customers')
    @UsePipes(PaginationPipe)
    async findAll(@Query() query: { page: number; limit: number }) {
        const { page, limit } = query;
        return this.customersService.findAllWithPagination(page, limit);
    }

    @Post('upload')
    async upload(@Body() rawXml: string) {
        const parsed = this.parserService.parseSafe(rawXml);

        const added: any[] = []
        const invalid: any[] = []
        const duplicated: any[] = []
        const failed: any[] = []

        for (const customer of parsed.customers.customer) {
            const createCustomerDto = plainToInstance(CreateCustomerDto, customer);

            try {
                await validateOrReject(createCustomerDto, { whitelist: true });
                added.push(await this.customersService.create(createCustomerDto));
            } catch (err) {
                if (err.code === 11000) {
                    duplicated.push(createCustomerDto);
                } else if (Array.isArray(err) && err[0]?.constraints) {
                    const reason = err.map(e => Object.values(e.constraints || {})).flat();
                    invalid.push({ ...createCustomerDto, reason });
                } else {
                    failed.push(createCustomerDto);
                }
            }
        }

        return { added, invalid, duplicated, failed };
    }
}
