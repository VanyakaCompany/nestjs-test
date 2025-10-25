import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class XmlContentTypeMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const contentType = req.headers['content-type'];
        if (!contentType || !['application/xml', 'text/xml'].includes(contentType)) {
            throw new BadRequestException('Invalid content type. Expected XML.');
        }
        next();
    }
}
