import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './database/prisma/prisma.module';
import { UsersModule } from './domains/users/users.module';
import { JwtManagerModule } from './jwt-manager/jwt-manager.module';
<<<<<<< Updated upstream
import { StorageModule } from './storage/storage.module';
=======
import { AmazonS3Module } from './storage/amazon-s3/amazon-s3.module';
import { MatchesModule } from './domains/matches/matches.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
>>>>>>> Stashed changes

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    JwtManagerModule,
    UsersModule,
<<<<<<< Updated upstream
    StorageModule,
  ],
  controllers: [AppController],
=======
    MatchesModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: AuthGuard }],
>>>>>>> Stashed changes
})
export class AppModule { }
