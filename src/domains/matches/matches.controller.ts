import {
  Controller,
  Get,
  Param,
  Delete,
  Post,
  Body,
  Put,
  Patch,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { User } from '@prisma/client';
import { CreateMatchDto, UpdateMatchDto } from './matches.dto';
import { Private } from 'src/decorators/private.decorator';
import { DAccount } from 'src/decorators/account.decorator';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) { }

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
}
