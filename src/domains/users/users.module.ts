import { Module } from '@nestjs/common';
import { StorageModule } from 'src/storage/storage.module';
import { KakaoAuthService } from './kakao-auth/kakao-auth.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, KakaoAuthService],
  imports: [StorageModule],
})
export class UsersModule {}
