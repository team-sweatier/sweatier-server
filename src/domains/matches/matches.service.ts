import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, User } from '@prisma/client';
import { nanoid } from 'nanoid';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UpdateMatchDto } from './matches.dto';
import { INVALID_MATCH, UNAUTHORIZED } from './matches-error.messages';

@Injectable()
export class MatchesService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) { }

  async findMatches() {
    return this.prismaService.match.findMany();
  }

  async findMatch(matchId: string) {
    const match = await this.prismaService.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException(INVALID_MATCH);
    }
    return this.prismaService.match.findUnique({
      where: {
        id: matchId,
      },
    });
  }

  async createMatch(
    user: User,
    data: Omit<Prisma.MatchUncheckedCreateInput, 'id' | 'hostId'>,
  ) {
    const id = nanoid(this.configService.get('NANOID_SIZE'));

    return await this.prismaService.match.create({
      data: {
        ...data,
        id,
        hostId: user.id,
      },
    });
  }

  async editMatch(userId: string, matchId: string, data: UpdateMatchDto) {
    const match = await this.prismaService.match.findUnique({
      where: { id: matchId },
    });
    if (!match) {
      throw new NotFoundException(INVALID_MATCH);
    }
    if (match.hostId !== userId) {
      throw new ForbiddenException(UNAUTHORIZED);
    }
    return await this.prismaService.match.update({
      where: { id: matchId },
      data,
    });
  }

  async deleteMatch(userId: string, matchId: string) {
    const match = await this.prismaService.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException(INVALID_MATCH);
    }
    if (match.hostId !== userId) {
      throw new ForbiddenException(UNAUTHORIZED);
    }
    return await this.prismaService.match.delete({
      where: {
        id: matchId,
      },
    });
  }
}
