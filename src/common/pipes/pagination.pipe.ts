import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class PaginationPipe implements PipeTransform {
    transform(value: any) {
        let { page, limit } = value;

        page = page ? parseInt(page, 10) : 1;
        limit = limit ? parseInt(limit, 10) : 10;

        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1) limit = 10;
        if (limit > 100) limit = 100;

        return { page, limit };
    }
}