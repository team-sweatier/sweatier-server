import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Match, Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { dayUtil } from 'src/utils/day';

import UserProfileNotFoundException from '../users/exceptions/user-profile-not-found.exception';
import MatchAlreadyRatedException from './exceptions/match-already-rated.exception';
import MatchCancelLockedException from './exceptions/match-cancel-locked.exception';
import MatchEditForbiddenException from './exceptions/match-edit-forbidden.exception';
import MatchGenderMismatchException from './exceptions/match-gender-mismatch.exception';
import MatchNotFinishedException from './exceptions/match-not-finished.exception';
import MatchNotFoundException from './exceptions/match-not-found.exception';
import MatchParticipationExpiredException from './exceptions/match-participation-expired.exception';
import MatchParticipationReachedLimitException from './exceptions/match-participation-reached-limit.exception';
import MatchSelfParticipationException from './exceptions/match-self-participation.exception';
import MatchSelfRatingException from './exceptions/match-self-rating.exception';
import MatchSportTypeNotFoundException from './exceptions/match-sport-type-not-found.exception';
import MatchTierMismatchException from './exceptions/match-tier-mismatch.exception';
import RaterNotInMatchException from './exceptions/rater-not-in-match.exception';
import UserNotInParticipantsException from './exceptions/user-not-in-participants.exception';
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
      const processedMatch = {
        ...match,
        applicants: match.participants.length,
        tier: match.tier.value,
        sportsType: [match.sportsType.name, match.sportsType.rules],
        participating: false,
      };

      processedMatch.participating = match.participants.some(
        (participant) => participant.id === userId,
      );

      return processedMatch;
    });

    return processedMatches;
  }

  async getQueryFilter(filters: FindMatchesDto | string) {
    const [todayUTC, endDateUTC] = [
      dayUtil.day().utc(),
      dayUtil.day().utc().add(2, 'weeks'),
    ];

    if (typeof filters === 'string' && filters.trim() === '') {
      return {
        matchDay: { gte: todayUTC.toDate(), lte: endDateUTC.toDate() },
      };
    }

    if (filters instanceof FindMatchesDto) {
      let matchDayFilter = {
        gte: todayUTC.toDate(),
        lte: endDateUTC.toDate(),
      };

      if (filters.date) {
        // 입력된 날짜를 KST로 파싱하고, UTC로 변환
        const dateStartKST = dayUtil.day(filters.date).startOf('day');
        const dateEndKST = dateStartKST.add(1, 'day');

        const dateStartUTC = dateStartKST.utc();
        const dateEndUTC = dateEndKST.utc();

        matchDayFilter = {
          gte: dateStartUTC.toDate(),
          lte: dateEndUTC.toDate(),
        };
      }

      return {
        matchDay: matchDayFilter,
        ...(filters.region && { region: filters.region }),
        ...(filters.sportType && {
          sportsType: { name: filters.sportType },
        }),
        ...(filters.tier && { tier: { value: filters.tier } }),
      };
    }

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
        sportsType: { select: { name: true, rules: true } },
      },
      orderBy: { matchDay: 'asc' },
    });
  }

  async findParticipateMatches(userId: string) {
    const userParticipatingMatches = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        participatingMatches: {
          include: {
            participants: {
              select: { id: true },
            },
            sportsType: true,
            tier: true,
          },
        },
      },
    });
    return userParticipatingMatches
      ? userParticipatingMatches.participatingMatches
      : [];
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
        sportsType: { select: { name: true, rules: true } },
        host: { select: { id: true } },
      },
    });

    if (!match) throw new MatchNotFoundException();

    const host = await this.prismaService.userProfile.findUnique({
      where: { userId: match.hostId },
    });

    const tier = match.tier.value;
    const sport = [match.sportsType.name, match.sportsType.rules];

    const result = {
      ...match,
      address: match.address,
      hostId: host.userId,
      hostNickname: host.nickName,
      hostOneLiner: host.oneLiner,
      hostBankName: host.bankName,
      hostAccountNumber: host.accountNumber,
      applicants: match.participants.length,
      tierType: tier,
      sportType: sport,
      hostProfileImgSrc:
        'https://storage.googleapis.com/sweatier-user-profile-image/' +
        host.userId,
      participating: false,
    };

    result.participating = match.participants.some(
      (participant) => participant.id === userId,
    );

    return result;
  }

  async createMatch(userId: string, data: CreateMatchDto) {
    const userProfile = await this.prismaService.userProfile.findUnique({
      where: { userId },
    });

    if (!userProfile) throw new UserProfileNotFoundException();

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

  async editMatch(
    userId: string,
    matchId: string,
    updateMatchDto: UpdateMatchDto,
  ) {
    const match = await this.findMatch(matchId, userId);

    if (match.hostId !== userId) throw new MatchEditForbiddenException();

    const data: any = { ...updateMatchDto };

    if (updateMatchDto.sportsTypeName) {
      const sportsType = await this.prismaService.sportsType.findUnique({
        where: { name: updateMatchDto.sportsTypeName },
      });

      if (!sportsType) throw new MatchSportTypeNotFoundException();

      data.sportsType = {
        connect: { id: sportsType.id },
      };

      delete data.sportsTypeName;
    }

    const updatedMatch = await this.prismaService.match.update({
      where: { id: matchId },
      data: data,
    });

    return updatedMatch;
  }

  async deleteMatch(userId: string, matchId: string) {
    const match = await this.findMatch(matchId, userId);

    if (match.hostId !== userId) throw new MatchEditForbiddenException();

    return await this.prismaService.match.delete({
      where: {
        id: matchId,
      },
    });
  }

  async participate(matchId: string, userId: string) {
    await this.validateParticipation(matchId, userId);

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
      const participationRate = match.participants.length / match.capability;
      const matchCancelLock = participationRate >= 0.8;
      if (matchCancelLock) throw new MatchCancelLockedException();

      const disconnectParticipant = {
        where: { id: matchId },
        include: {
          participants: { select: { id: true } },
        },
        data: {
          participants: { disconnect: { id: userId } },
        },
      };

      return await this.prismaService.match.update(disconnectParticipant);
    }

    const userProfile = await this.prismaService.userProfile.findUnique({
      where: { userId: userId },
    });

    if (!userProfile) throw new UserProfileNotFoundException();

    if (match.hostId === userProfile.userId)
      throw new MatchSelfParticipationException();

    if (match.participants.length >= match.capability)
      throw new MatchParticipationReachedLimitException();

    if (match.gender !== 'both' && match.gender !== userProfile.gender)
      throw new MatchGenderMismatchException();

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

  async validateParticipation(matchId: string, userId: string) {
    const match = await this.findMatch(matchId, userId);

    const userTier = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { tiers: { select: { id: true } } },
    });

    if (!userTier.tiers.some((tier) => tier.id === match.tierId))
      throw new MatchTierMismatchException();

    if (match.hostId === userId) throw new MatchSelfParticipationException();

    const now = new Date();
    if (now >= match.matchDay) throw new MatchParticipationExpiredException();
  }

  async ratePlayers(
    matchId: string,
    raterId: string,
    ratings: ParticipantRating[],
  ) {
    const match = await this.findMatch(matchId, raterId);

    this.validateMatchRating(match.participants, match, raterId);

    const ratePromises = ratings.map(async (rating) => {
      const isParticipantInMatch = match.participants.some(
        (participant) => participant.id === rating.participantId,
      );

      if (!isParticipantInMatch) throw new UserNotInParticipantsException();

      if (rating.participantId === raterId)
        throw new MatchSelfRatingException();

      const foundScore = await this.prismaService.rating.findFirst({
        where: {
          userId: rating.participantId,
          raterId: raterId,
          matchId: matchId,
        },
      });

      if (foundScore) throw new MatchAlreadyRatedException();

      return await this.ratePlayer(matchId, raterId, {
        participantId: rating.participantId,
        value: rating.value,
      });
    });

    return await Promise.all(ratePromises);
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

  validateMatchRating(
    matchParticipants: {
      id: string;
      userProfile: {
        nickName: string;
      };
    }[],
    match: Match,
    raterId: string,
  ) {
    const now = new Date();
    if (now < match.matchDay) throw new MatchNotFinishedException();

    const isRaterParticipant = matchParticipants.some(
      (participant) => participant.id === raterId,
    );

    if (!isRaterParticipant) throw new RaterNotInMatchException();
  }
}
