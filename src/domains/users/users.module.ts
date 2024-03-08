import { Module } from '@nestjs/common';
import { KakaoAuthService } from './kakao-auth/kakao-auth.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, KakaoAuthService],
})
export class UsersModule {}
