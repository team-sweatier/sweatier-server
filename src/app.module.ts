import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { PrismaModule } from './database/prisma/prisma.module';
import { MatchesModule } from './domains/matches/matches.module';
import { TiersModule } from './domains/tiers/tiers.module';
import { UsersModule } from './domains/users/users.module';
import { AuthGuard } from './guards/auth.guard';
import { JwtManagerModule } from './jwt-manager/jwt-manager.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    JwtManagerModule,
    UsersModule,
    MatchesModule,
    StorageModule,
    TiersModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
