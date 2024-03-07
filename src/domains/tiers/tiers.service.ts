import { Injectable } from '@nestjs/common';
import { PrismaService } from './../../database/prisma/prisma.service';

@Injectable()
export class TiersService {
  constructor(private readonly prismaService: PrismaService) {}

  async getTiers() {
    return this.prismaService.tier.findMany({
      where: { sportsTypeId: 1 },
      select: { value: true, description: true },
    });
  }
}
