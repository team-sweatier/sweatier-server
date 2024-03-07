import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { PrismaModule } from './database/prisma/prisma.module';
import { MatchesModule } from './domains/matches/matches.module';
import { UsersModule } from './domains/users/users.module';
import { AuthGuard } from './guards/auth.guard';
import { JwtManagerModule } from './jwt-manager/jwt-manager.module';
import { StorageModule } from './storage/storage.module';
import { TiersModule } from './domains/tiers/tiers.module';

@Module({
  imports: [
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
