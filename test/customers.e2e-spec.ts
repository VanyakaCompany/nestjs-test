import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import request from 'supertest';
import * as bodyParser from 'body-parser';
import { App } from 'supertest/types';
import { CustomersModule } from './../src/customers/customers.module';
import { Customer, CustomerSchema } from '../src/customers/schemas/customer.schema';
import { ExternalService } from '../src/customers/external.service';
import { TasksService } from '../src/customers/tasks.service';
import { CustomersService } from '../src/customers/customers.service';

describe('CustomersModule (e2e)', () => {
    let app: INestApplication<App>;
    let customersService: CustomersService;
    let tasksService: TasksService;
    let externalService: ExternalService;
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create({ binary: { version: '4.4.29' } }); // Cтабильная версия без AVX

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ isGlobal: true }),
                MongooseModule.forRootAsync({
                    useFactory: async () => ({ uri: mongoServer.getUri() }),
                }),
                MongooseModule.forFeature([{ name: Customer.name, schema: CustomerSchema }]),
                ScheduleModule.forRoot(),
                CustomersModule,
            ],
            providers: [ExternalService, TasksService, CustomersService],
        })
            .overrideProvider(ExternalService)
            .useValue({
                getStatus: jest.fn().mockResolvedValue('verified'),
            })
            .overrideProvider(ConfigService)
            .useValue({
                get: jest.fn().mockImplementation((key: string) => {
                    if (key === 'API_INTERVAL') return 10000;
                    if (key === 'API_TIMEOUT') return 10000;
                    return null;
                }),
            })
            .compile();

        app = moduleFixture.createNestApplication();
        app.use(bodyParser.text({ type: 'application/xml' }));
        await app.init();

        customersService = app.get<CustomersService>(CustomersService);
        tasksService = app.get<TasksService>(TasksService);
        externalService = app.get<ExternalService>(ExternalService);
    });

    afterAll(async () => {
        await app.close();
        await mongoServer.stop();
    });

    it('/upload (POST) — should parse XML and insert customers into DB', async () => {
        const xmlData = `
            <customers>
                <customer>
                    <id>1</id>
                    <name>Ivan Ivanov</name>
                    <email>ivan@example.com</email>
                </customer>
                <customer>
                    <id>2</id>
                    <name>Maria Petrova</name>
                    <email>maria@example.com</email>
                </customer>
            </customers>
        `;

        return request(app.getHttpServer())
            .post('/upload')
            .set('Content-Type', 'application/xml')
            .send(xmlData)
            .expect(201)
            .then((res) => expect(res.body.added.length).toBe(2));
    });

    it('/upload (POST) — should validate XML syntax', async () => {
        const xmlData = `
            <customers>
                <customer
                    <id>3</id>
                    <name>Vlodimir Volodin</name>
                    <email>ivanexample.com</email>
                </customer>
            </customers>
        `;

        return request(app.getHttpServer())
            .post('/upload')
            .set('Content-Type', 'application/xml')
            .send(xmlData)
            .expect(400)
            .then((res) => expect(res.body.error).toBe('Invalid XML'));
    });

    it('/upload (POST) — should validate XML structure', async () => {
        const xmlData = `
            <clowns>
                <clown>
                    <name>Petrushka</name>
                </clown>
            </clowns>
        `;

        return request(app.getHttpServer())
            .post('/upload')
            .set('Content-Type', 'application/xml')
            .send(xmlData)
            .expect(400)
            .then((res) => expect(res.body.message).toMatch(/Invalid XML structure/));
    });

    it('/upload (POST) — should validate customers data', async () => {
        const xmlData = `
            <customers>
                <customer>
                    <id>3</id>
                    <name>Vlodimir Volodin</name>
                    <email>ivanexample.com</email>
                </customer>
            </customers>
        `;

        const response = await request(app.getHttpServer())
            .post('/upload')
            .set('Content-Type', 'application/xml')
            .send(xmlData)
            .expect(201);

        expect(response.body.added.length).toBe(0);
        expect(response.body.invalid.length).toBe(1);
        expect(response.body.invalid[0].reason).toContain('Email must be valid');
    });

    it('should update customer status via scheduled task', async () => {
        await tasksService.updateStatus(); // Явно вызываем задачу (вместо cron-триггера)

        expect(externalService.getStatus).toHaveBeenCalledWith(1);

        const updated = await customersService.findOne({ id: 1 });

        expect(updated?.status).toBe('verified');
    });

    it('/customers (GET) — should return customers with pagination', async () => {
        const response = await request(app.getHttpServer()).get('/customers').expect(200);

        expect(response.body.data.length).toBe(2);
        expect(response.body.meta).toEqual({
            total: expect.any(Number),
            page: expect.any(Number),
            limit: expect.any(Number),
            totalPages: expect.any(Number),
        });
    });
});
