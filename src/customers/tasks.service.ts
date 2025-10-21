import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronTime } from 'cron';
import { ConfigService } from '@nestjs/config';
import { CustomersService } from './customers.service';
import { ExternalService } from './external.service';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly customersService: CustomersService,
        private readonly externalService: ExternalService,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) {}

    private rescheduleCron(name: string, delay: number | string): void {
        const job = this.schedulerRegistry.getCronJob(name);

        if (!job) {
            this.logger.error(`Cron job '${name}' not found`);
            return;
        }

        const nextTime = typeof delay === 'string' ? new CronTime(delay) : new CronTime(new Date(Date.now() + delay));

        job.setTime(nextTime);
        job.start();
    }

    @Cron(CronExpression.EVERY_30_SECONDS, { name: 'update-status' })
    async updateStatus() {
        const cronName = 'update-status';
        const interval = this.configService.get<string>('API_INTERVAL')!;
        const timeout = this.configService.get<string>('API_TIMEOUT')!;

        try {
            let customer = await this.customersService.findOne(
                {},
                {
                    excludeFields: ['status'],
                    sort: { updatedAt: 1 },
                },
            );

            if (customer) {
                const status = await this.externalService.getStatus(customer.id);
                customer = await this.customersService.updateOne({ id: customer.id }, { status });

                if (customer) this.logger.debug(`Customer #${customer.id} get status '${customer.status}'`);

                this.rescheduleCron(cronName, interval);
            } else {
                this.rescheduleCron(cronName, timeout);
            }
        } catch {
            this.logger.error(`Couldn't get сustomer status`);
            this.rescheduleCron(cronName, timeout);
        }
    }
}
