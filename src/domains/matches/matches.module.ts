import { Module, forwardRef } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

@Module({
  controllers: [MatchesController],
  providers: [MatchesService],
  imports: [forwardRef(() => UsersModule)],
  exports: [MatchesService],
})
export class MatchesModule {}
