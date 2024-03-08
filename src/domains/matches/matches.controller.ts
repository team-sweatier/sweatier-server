import {
  Controller,
  Get,
  Param,
  Delete,
  Post,
  Body,
  Put,
  Patch,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { User } from '@prisma/client';
import { CreateMatchDto, RateDto, UpdateMatchDto } from './matches.dto';
import { Private } from 'src/decorators/private.decorator';
import { DAccount } from 'src/decorators/account.decorator';
import { ALREADY_RATED, INVALID_MATCH, INVALID_RATING, SELF_RATING } from './matches-error.messages';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Controller('matches')
export class MatchesController {
  constructor(
    private readonly matchesService: MatchesService,
    private readonly prismaService: PrismaService,
  ) { }

  @Get()
  async findMatches() {
    return await this.matchesService.findMatches();
  }

  @Get(':matchId')
  async findMatch(@Param('matchId') matchId: string) {
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
    return await this.matchesService.editMatch(user.id, matchId, dto);
  }

  @Delete(':matchId')
  @Private('user')
  async deleteMatch(
    @DAccount('user') user: User,
    @Param('matchId') matchId: string,
  ) {
    return await this.matchesService.deleteMatch(user.id, matchId);
  }

  @Put(':matchId/participate')
  @Private('user')
  async applyMatch(
    @DAccount('user') user: User,
    @Param('matchId') matchId: string,
  ) {
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
    if (dto.userId === rater.id) {
      throw new ConflictException(SELF_RATING);
    }

    if (
      !match.participants.some(
        (participant) => participant.id === dto.userId,
      ) ||
      !match.participants.some((participant) => participant.id === rater.id)
    ) {
      throw new ConflictException(INVALID_RATING);
    }

    const foundScore = await this.prismaService.rating.findFirst({
      where: {
        userId: dto.userId,
        raterId: rater.id,
        matchId: matchId,
      },
    });

    if (foundScore) {
      throw new ConflictException(ALREADY_RATED);
    }
    return await this.matchesService.ratePlayer(matchId, rater.id, dto);
  }
}
