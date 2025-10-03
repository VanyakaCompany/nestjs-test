import { Controller, Get, Post, Body } from '@nestjs/common';
import { ParserService } from './parser.service';
import { CustomersService } from './customers.service';

@Controller()
export class CustomersController {
    constructor(
        private readonly customersService: CustomersService,
        private readonly parserService: ParserService,
    ) {}

    @Get('customers')
    async findAll() {
        return this.customersService.findAll()
    }

    @Post('upload')
    upload(@Body() rawXml: string) {
        const parsed = this.parserService.parseSafe(rawXml);
        return { parsed };
    }
}
