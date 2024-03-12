import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { KST_OFFSET_HOURS, dayUtil } from 'src/utils/day';
import {
  INVALID_APPLICATION,
  INVALID_GENDER,
  MAX_PARTICIPANTS_REACHED,
  MIN_PARTICIPANTS_REACHED,
  PROFILE_NEEDED,
} from './matches-error.messages';
import {
  CreateMatchDto,
  FindMatchesDto,
  ParticipantRating,
  UpdateMatchDto,
} from './matches.dto';

@Injectable()
export class MatchesService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async findMatches(filters: FindMatchesDto) {
    const todayUTC = dayUtil.day().utc();
    const endDateUTC = todayUTC.add(2, 'weeks');

    const where: Prisma.MatchWhereInput = {
      matchDay: {
        gte: todayUTC.toDate(),
        lte: endDateUTC.toDate(),
      },
    };

    if (filters.date) {
      const parsedDate = dayUtil.day(filters.date);
      const nextDate = parsedDate.add(1, 'day');

      where.matchDay = { gte: parsedDate.toDate(), lt: nextDate.toDate() };
    }

    if (filters.region) {
      where.region = filters.region;
    }

    if (filters.sportType) {
      where.sportsType = {
        name: filters.sportType,
      };
    }

    if (filters.tier) {
      where.tier = {
        value: filters.tier,
      };
    }

    let matches = await this.prismaService.match.findMany({
      where: where,
    });
    matches = matches.map((match) => ({
      ...match,
      matchDay: new Date(
        match.matchDay.getTime() + KST_OFFSET_HOURS * 60 * 60 * 1000,
      ),
    }));

    return matches;
  }

  async findMatchesByKeywords(keywords: string) {
    const search = keywords
      .split(' ')
      .filter((keyword) => keyword.trim() !== '')
      .map((keyword) => `${keyword.trim()}:*`)
      .join(' & ');

    const matches = await this.prismaService.match.findMany({
      where: {
        OR: [
          {
            title: {
              search,
            },
          },
          {
            content: {
              search,
            },
          },
        ],
      },
    });

    return matches;
  }

  async findMatch(matchId: string) {
    const match = await this.prismaService.match.findUnique({
      where: {
        id: matchId,
      },
      include: {
        participants: {
          select: {
            id: true,
          },
        },
      },
    });

    const host = await this.prismaService.userProfile.findUnique({
      where: {
        userId: match.hostId,
      },
    });

    const result: {
      address: string;
      hostId: string;
      hostNickname: string;
      hostOneLiner: string | null;
      hostBankName: string;
      hostAccountNumber: string;
      applicants: number;
      matchDay: Date;
    } & typeof match = {
      ...match,
      address: match.address,
      hostId: host.userId,
      hostNickname: host.nickName,
      hostOneLiner: host.oneLiner,
      hostBankName: host.bankName,
      hostAccountNumber: host.accountNumber,
      applicants: match.participants.length,
      matchDay: new Date(
        match.matchDay.getTime() + KST_OFFSET_HOURS * 60 * 60 * 1000,
      ),
    };

    return result;
  }

  async createMatch(userId: string, data: CreateMatchDto) {
    const { sportsTypeName, ...matchData } = data;
    const id = nanoid(this.configService.get('NANOID_SIZE'));
    const foundUser = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { tiers: true },
    });
    const sportType = await this.prismaService.sportsType.findUnique({
      where: { name: sportsTypeName },
    });
    const tier = foundUser.tiers.find(
      (tier) => tier.sportsTypeId === sportType.id,
    );

    const match = await this.prismaService.match.create({
      data: {
        ...matchData,
        id,
        hostId: userId,
        sportsTypeId: sportType.id,
        tierId: tier.id,
        participants: {
          connect: {
            id: userId,
          },
        },
      },
      select: {
        id: true,
        hostId: true,
      },
    });
    return match;
  }

  async editMatch(matchId: string, data: UpdateMatchDto) {
    return await this.prismaService.match.update({
      where: { id: matchId },
      data,
    });
  }

  async deleteMatch(matchId: string) {
    return await this.prismaService.match.delete({
      where: {
        id: matchId,
      },
    });
  }

  async participate(matchId: string, userId: string) {
    const match = await this.prismaService.match.findUnique({
      where: { id: matchId },
      include: {
        participants: true,
      },
    });

    const isParticipating = match.participants.some(
      (participant) => participant.id === userId,
    );

    if (isParticipating) {
      if (match.participants.length / match.capability >= 0.8) {
        throw new ConflictException(MIN_PARTICIPANTS_REACHED);
      }
      return await this.prismaService.match.update({
        where: { id: matchId },
        include: {
          participants: {
            select: {
              id: true,
            },
          },
        },
        data: {
          participants: {
            disconnect: {
              id: userId,
            },
          },
        },
      });
    }

    const user = await this.prismaService.userProfile.findUnique({
      where: { userId: userId },
    });

    if (!user) {
      throw new UnauthorizedException(PROFILE_NEEDED);
    }

    if (match.hostId === user.userId) {
      throw new UnauthorizedException(INVALID_APPLICATION);
    }

    if (match.participants.length >= match.capability) {
      throw new ConflictException(MAX_PARTICIPANTS_REACHED);
    }

    if (match.gender !== 'both' && match.gender !== user.gender) {
      throw new UnauthorizedException(INVALID_GENDER);
    }

    const newParticipant = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    return await this.prismaService.match.update({
      where: { id: matchId },
      include: {
        participants: {
          select: {
            id: true,
          },
        },
      },
      data: {
        participants: {
          connect: {
            id: newParticipant.id,
          },
        },
      },
    });
  }
  async ratePlayer(matchId: string, raterId: string, data: ParticipantRating) {
    const id = nanoid(this.configService.get('NANOID_SIZE'));
    return await this.prismaService.rating.create({
      data: {
        id: id,
        matchId,
        raterId,
        userId: data.participantId,
        value: data.value,
      },
    });
  }
}
