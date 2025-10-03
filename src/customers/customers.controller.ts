import { Controller, Get, Post, Body } from '@nestjs/common';
import { ParserService } from './parser.service';

@Controller()
export class CustomersController {
    constructor(private readonly parserService: ParserService) {}

    @Get('customers')
    findAll(): string {
        return 'Список всех пользователей в БД';
    }

    @Post('upload')
    upload(@Body() rawXml: string) {
        const parsed = this.parserService.parseSafe(rawXml);
        return { parsed };
    }
}
