import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';
import { DAccount } from 'src/decorators/account.decorator';
import { Private } from 'src/decorators/private.decorator';
import { JwtManagerService } from 'src/jwt-manager/jwt-manager.service';
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
    private readonly jwtManagerService: JwtManagerService,
    private readonly matchesService: MatchesService,
  ) {}

  @Get()
  async findMatches(@Query() filters: FindMatchesDto, @Req() request: Request) {
    const accessToken = request.cookies['accessToken'];

    if (!accessToken)
      return await this.matchesService.findMatches(filters, null);

    const userId = (await this.jwtManagerService.verifyAccessToken(accessToken))
      .id;

    return await this.matchesService.findMatches(filters, userId);
  }

  @Get('/search')
  async findMatchesByKeywords(
    @Query('keywords') keywords: string,
    @Req() request: Request,
  ) {
    const accessToken = request.cookies['accessToken'];

    if (!accessToken)
      return await this.matchesService.findMatches(keywords, null);

    const userId = (await this.jwtManagerService.verifyAccessToken(accessToken))
      .id;

    return await this.matchesService.findMatches(keywords, userId);
  }

  @Get(':matchId')
  async findMatch(@Param('matchId') matchId: string, @Req() request: Request) {
    const accessToken = request.cookies['accessToken'];

    if (!accessToken) return await this.matchesService.findMatch(matchId, null);

    const userId = (await this.jwtManagerService.verifyAccessToken(accessToken))
      .id;

    return await this.matchesService.findMatch(matchId, userId);
  }

  @Post()
  @Private('user')
  async createMatch(@DAccount('user') user: User, @Body() dto: CreateMatchDto) {
    return await this.matchesService.createMatch(user.id, dto);
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
    return await this.matchesService.ratePlayers(
      matchId,
      rater.id,
      dto.ratings,
    );
  }
}
