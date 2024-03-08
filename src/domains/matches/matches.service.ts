import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, User } from '@prisma/client';
import { nanoid } from 'nanoid';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UpdateMatchDto } from './matches.dto';
import {
  INVALID_APPLICATION,
  INVALID_GENDER,
  INVALID_MATCH,
  MAX_PARTICIPANTS_REACHED,
  MIN_PARTICIPANTS_REACHED,
  PROFILE_NEEDED,
  UNAUTHORIZED,
} from './matches-error.messages';

@Injectable()
export class MatchesService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) { }

  async findMatches() {
    return await this.prismaService.match.findMany();
  }

  async findMatch(matchId: string) {
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
    await this.prismaService.match.create({
      data: {
        ...data,
        id,
        hostId: user.id,
        participants: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return await this.prismaService.match.findUnique({
      where: { id: id },
      include: { participants: true },
    });
  }

  async editMatch(userId: string, matchId: string, data: UpdateMatchDto) {
    return await this.prismaService.match.update({
      where: { id: matchId },
      data,
    });
  }

  async deleteMatch(userId: string, matchId: string) {
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

  async ratePlayer(
    matchId: string,
    graderId: string,
    data: Omit<
      Prisma.RatingUncheckedCreateInput,
      'id' | 'raterId' | 'sportsTypeId' | 'matchId'
    >,
  ) {
    const match = await this.prismaService.match.findUnique({
      where: { id: matchId },
      include: {
        participants: true,
      },
    });

    const id = nanoid(this.configService.get('NANOID_SIZE'));
    return await this.prismaService.rating.create({
      data: {
        id: id,
        userId: data.userId,
        raterId: graderId,
        sportsTypeId: match.sportsTypeId,
        matchId: matchId,
        ...data,
      },
    });
  }
}
