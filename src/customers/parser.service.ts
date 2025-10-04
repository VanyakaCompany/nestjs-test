import { Injectable, BadRequestException } from '@nestjs/common';
import { XMLParser, XMLValidator } from 'fast-xml-parser';

@Injectable()
export class ParserService {
    private parser: XMLParser;

    constructor() {
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            allowBooleanAttributes: true,
        });
    }

    /**
     * Проверка XML на валидность
     */
    validate(rawXml: string): void {
        const validation = XMLValidator.validate(rawXml);
        if (validation !== true) {
            throw new BadRequestException({
                error: 'Invalid XML',
                details: validation,
            });
        }
    }

    /**
     * Парсинг XML в объект
     */
    parse<T = any>(rawXml: string): T {
        return this.parser.parse(rawXml);
    }

    /**
     * Удобный метод: сразу validate + parse
     */
    parseSafe<T = any>(rawXml: string): T {
        this.validate(rawXml);
        return this.parse<T>(rawXml);
    }
}