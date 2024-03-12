import {
  BadRequestException,
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
  INVALID_APPLICATION,
  INVALID_DATE,
  INVALID_MATCH,
  PROFILE_NEEDED,
  UNAUTHORIZED,
} from './matches-error.messages';
import { CreateMatchDto, FindMatchesDto, UpdateMatchDto } from './matches.dto';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(
    private readonly matchesService: MatchesService,
    private readonly prismaService: PrismaService,
  ) { }

  @Get()
  async findMatches(@Query() filters: FindMatchesDto) {
    return await this.matchesService.findMatches(filters);
  }

  @Get('/search')
  async findMatchesByKeywords(@Query('keywords') keywords: string) {
    return await this.matchesService.findMatchesByKeywords(keywords);
  }

  @Get(':matchId')
  async findMatch(
    @Param('matchId') matchId: string,
    @DAccount('user') user: User,
  ) {
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
    const profile = await this.prismaService.userProfile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) throw new NotFoundException(PROFILE_NEEDED);

    const now = new Date();

    const matchDayDate = new Date(dto.matchDay);
    if (matchDayDate <= now) {
      throw new BadRequestException(INVALID_DATE);
    }
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

    const now = new Date();
    if (now >= match.matchDay) {
      throw new BadRequestException(INVALID_APPLICATION);
    }
    return await this.matchesService.participate(matchId, user.id);
  }
}
