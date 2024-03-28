import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { adjustDates, convertUTCDateToKST } from './date.middleware';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    this.setMiddlewares();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
  setMiddlewares() {
    this.$use(async (params, next) => {
      const result = await next(params);

      adjustDates(result, convertUTCDateToKST);

      return result;
    });
  }
}
