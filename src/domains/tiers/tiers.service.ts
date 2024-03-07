import { Injectable } from '@nestjs/common';
import { PrismaService } from './../../database/prisma/prisma.service';

@Injectable()
export class TiersService {
  constructor(private readonly prismaService: PrismaService) {}

  async getTiers() {
    return await this.prismaService.tier.findMany({
      distinct: ['value'],
      select: { value: true, description: true },
    });
  }
}
