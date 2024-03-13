import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { dayUtil } from 'src/utils/day';
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

  async findMatches(filters: FindMatchesDto | string, userId: string) {
    const filter: Prisma.MatchWhereInput = await this.getQueryFilter(filters);

    const matches = await this.filterMatches(filter);

    const processedMatches = matches.map((match) => {
      const participating = userId
        ? match.participants.some((participant) => participant.id === userId)
        : false;

      return {
        ...match,
        matchDay: new Date(),
        applicants: match.participants.length,
        tier: match.tier.value,
        sportsType: match.sportsType.name,
        participating: participating,
      };
    });

    return processedMatches;
  }

  async getQueryFilter(filters: FindMatchesDto | string) {
    const [todayUTC, endDateUTC] = [
      dayUtil.day().utc(),
      dayUtil.day().utc().add(2, 'weeks'),
    ];

    if (filters instanceof FindMatchesDto)
      return {
        matchDay: {
          gte: todayUTC.toDate(),
          lte: endDateUTC.toDate(),
        },
        ...(filters.date && {
          matchDay: {
            gte: dayUtil.day(filters.date).toDate(),
            lt: dayUtil.day(filters.date).add(1, 'day').toDate(),
          },
        }),
        ...(filters.region && { region: filters.region }),
        ...(filters.sportType && {
          sportsType: { name: filters.sportType },
        }),
        ...(filters.tier && { tier: { value: filters.tier } }),
      };

    const search = filters
      .split(' ')
      .filter((keyword) => keyword)
      .map((keyword) => `${keyword}:*`)
      .join(' & ');

    return {
      matchDay: { gte: todayUTC.toDate(), lte: endDateUTC.toDate() },
      OR: [{ title: { search } }, { content: { search } }],
    };
  }

  async filterMatches(filter: Prisma.MatchWhereInput) {
    return await this.prismaService.match.findMany({
      where: filter,
      include: {
        participants: { select: { id: true } },
        tier: { select: { value: true } },
        sportsType: { select: { name: true } },
      },
    });
  }

  async findMatch(matchId: string, userId: string) {
    const match = await this.prismaService.match.findUnique({
      where: { id: matchId },
      include: {
        participants: {
          select: {
            id: true,
            userProfile: { select: { nickName: true } },
          },
        },
        tier: { select: { value: true } },
        sportsType: { select: { name: true } },
      },
    });

    const host = await this.prismaService.userProfile.findUnique({
      where: { userId: match.hostId },
    });

    const participating = match.participants.find(
      (participant) => participant.id === userId,
    )
      ? true
      : false;

    const tier = match.tier.value;
    const sport = match.sportsType.name;

    const matchResult = {
      ...match,
      participate: match.participants.map((participant) => ({
        id: participant.id,
        nickName: participant.userProfile.nickName,
      })),
    };

    const result = {
      ...matchResult,
      address: match.address,
      hostId: host.userId,
      hostNickname: host.nickName,
      hostOneLiner: host.oneLiner,
      hostBankName: host.bankName,
      hostAccountNumber: host.accountNumber,
      applicants: match.participants.length,
      matchDay: new Date(),
      tierType: tier,
      sportType: sport,
      participating: participating,
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
