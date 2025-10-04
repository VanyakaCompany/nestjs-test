import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ExternalService {
    constructor(private readonly configService: ConfigService) { }

    async getStatus(id: number) {
        const res = await axios.get(
            `${this.configService.get<string>('API_URI')}/verify/${id}`,
        );
        return res.data.status;
    }
}