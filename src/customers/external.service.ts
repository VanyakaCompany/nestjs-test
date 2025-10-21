import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface VerifyResponse {
    id: number;
    status: string;
}

@Injectable()
export class ExternalService {
    constructor(private readonly configService: ConfigService) {}

    async getStatus(id: number): Promise<string> {
        const res = await axios.get<VerifyResponse>(`${this.configService.get<string>('API_URI')}/verify/${id}`);

        if (!res.data || typeof res.data.status !== 'string' || res.data.id !== id) {
            throw new Error('Invalid response from external API');
        }

        return res.data.status;
    }
}
