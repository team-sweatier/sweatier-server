import { Module } from '@nestjs/common';
import { MatchesController } from './MatchesController';
import { MatchesService } from './matches.service';

@Module({
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule { }
