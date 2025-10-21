import { Injectable, BadRequestException } from '@nestjs/common';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { CustomersDto } from './dto/customers.dto';

interface ParsedCustomers {
    customers: CustomersDto;
}

@Injectable()
export class ParserService {
    private parser: XMLParser;

    constructor() {
        this.parser = new XMLParser({
            isArray: (tagName) => tagName === 'customer',
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            allowBooleanAttributes: true,
        });
    }

    validate(rawXml: string): void {
        const validation = XMLValidator.validate(rawXml);
        if (validation !== true) {
            throw new BadRequestException({
                error: 'Invalid XML',
                details: validation,
            });
        }
    }

    parse(rawXml: string): ParsedCustomers {
        const result = this.parser.parse(rawXml) as ParsedCustomers;

        if (!result.customers || !result.customers.customer) {
            throw new BadRequestException('Invalid XML structure (no customers/customer)');
        }

        return result;
    }

    parseSafe(rawXml: string): ParsedCustomers {
        this.validate(rawXml);
        return this.parse(rawXml);
    }
}
