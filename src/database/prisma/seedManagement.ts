import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { seed } from './prisma.seed';

@Injectable()
export class SeedManagementService {
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async manageSeedData() {
    try {
      await seed();
      console.log('Monthly seed data generation completed successfully');
    } catch (error) {
      console.error('Error during monthly seed data generation:', error);
    }
  }
}
