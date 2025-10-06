import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ExternalService } from './external.service';

jest.mock('axios');

describe('ExternalService', () => {
    let externalService: ExternalService;
    let configService: ConfigService;

    const mockAxios = axios as jest.Mocked<typeof axios>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ExternalService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockImplementation((key: string) => {
                            if (key === 'API_URI') return 'http://mock-api.com';
                            return null;
                        }),
                    },
                },
            ],
        }).compile();

        externalService = module.get<ExternalService>(ExternalService);
        configService = module.get<ConfigService>(ConfigService);
    });


    it('should be defined', () => {
        expect(externalService).toBeDefined();
    });


    it('should return status from API', async () => {
        mockAxios.get.mockResolvedValueOnce({ data: { id: 123, status: 'verified' } });

        const result = await externalService.getStatus(123);

        expect(result).toBe('verified');
        expect(mockAxios.get).toHaveBeenCalledWith('http://mock-api.com/verify/123');
        expect(configService.get).toHaveBeenCalledWith('API_URI');
    });
    

    it('should throw if axios fails', async () => {
        mockAxios.get.mockRejectedValueOnce(new Error('Network error'));

        await expect(externalService.getStatus(123)).rejects.toThrow('Network error');
    });
});