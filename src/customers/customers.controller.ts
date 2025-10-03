import { Controller, Get, Post } from '@nestjs/common';

@Controller('customers')
export class CustomersController {
    @Get()
    findAll(): string {
        return 'Список всех пользователей в БД';
    }

    @Post()
    upload(): string {
        return 'Добавление пользователей';
    }
}
