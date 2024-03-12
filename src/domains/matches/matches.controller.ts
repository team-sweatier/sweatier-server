import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { DAccount } from 'src/decorators/account.decorator';
import { Private } from 'src/decorators/private.decorator';
import {
  ALREADY_RATED,
  INVALID_APPLICATION,
  INVALID_MATCH,
  SELF_RATING,
  UNAUTHORIZED,
} from './matches-error.messages';
import {
  CreateMatchDto,
  FindMatchesDto,
  RateDto,
  UpdateMatchDto,
} from './matches.dto';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(
    private readonly matchesService: MatchesService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  async findMatches(@Query() filters: FindMatchesDto) {
    return await this.matchesService.findMatches(filters);
  }

  @Get('/search')
  async findMatchesByKeywords(@Query('keywords') keywords: string) {
    return await this.matchesService.findMatchesByKeywords(keywords);
  }

  @Get(':matchId')
  async findMatch(@Param('matchId') matchId: string) {
    const match = await this.prismaService.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException(INVALID_MATCH);
    }
    return await this.matchesService.findMatch(matchId);
  }

  @Post()
  @Private('user')
  async createMatch(@DAccount('user') user: User, @Body() dto: CreateMatchDto) {
    return await this.matchesService.createMatch(user, dto);
  }

  @Put(':matchId')
  @Private('user')
  async editMatch(
    @DAccount('user') user: User,
    @Param('matchId') matchId: string,
    @Body() dto: UpdateMatchDto,
  ) {
    const match = await this.prismaService.match.findUnique({
      where: { id: matchId },
    });
    if (!match) {
      throw new NotFoundException(INVALID_MATCH);
    }
    if (match.hostId !== user.id) {
      throw new ForbiddenException(UNAUTHORIZED);
    }
    return await this.matchesService.editMatch(matchId, dto);
  }

  @Delete(':matchId')
  @Private('user')
  async deleteMatch(
    @DAccount('user') user: User,
    @Param('matchId') matchId: string,
  ) {
    const match = await this.prismaService.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException(INVALID_MATCH);
    }
    if (match.hostId !== user.id) {
      throw new ForbiddenException(UNAUTHORIZED);
    }
    return await this.matchesService.deleteMatch(matchId);
  }

  @Put(':matchId/participate')
  @Private('user')
  async applyMatch(
    @DAccount('user') user: User,
    @Param('matchId') matchId: string,
  ) {
    const match = await this.prismaService.match.findUnique({
      where: { id: matchId },
      include: {
        participants: true,
      },
    });

    if (!match) {
      throw new NotFoundException(INVALID_MATCH);
    }

    if (match.hostId === user.id) {
      throw new ConflictException(INVALID_APPLICATION);
    }
    return await this.matchesService.participate(matchId, user.id);
  }

  @Post(':matchId/rating')
  @Private('user')
  async rateParticipants(
    @DAccount('user') rater: User,
    @Param('matchId') matchId: string,
    @Body() dto: RateDto,
  ) {
    const match = await this.prismaService.match.findUnique({
      where: { id: matchId },
      include: {
        participants: true,
      },
    });
    if (!match) {
      throw new NotFoundException(INVALID_MATCH);
    }

    const ratePromises = dto.ratings.map(async (rating) => {
      if (rating.participantId === rater.id) {
        throw new ConflictException(SELF_RATING);
      }

      const foundScore = await this.prismaService.rating.findFirst({
        where: {
          userId: rating.participantId,
          raterId: rater.id,
          matchId: matchId,
        },
      });
      if (foundScore) {
        throw new ConflictException(ALREADY_RATED);
      }
      return await this.matchesService.ratePlayer(matchId, rater.id, {
        participantId: rating.participantId,
        value: rating.value,
      });
    });
    const completedRating = await Promise.all(ratePromises);
    return completedRating;
  }
}
// if (
//   !match.participants.some((participant) => participant.id === ratings) ||
//   !match.participants.some((participant) => participant.id === rater.id)
// ) {
//   throw new ConflictException(INVALID_RATING);
// }
