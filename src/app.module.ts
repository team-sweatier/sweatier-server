import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './database/prisma/prisma.module';
import { UsersModule } from './domains/users/users.module';
import { JwtManagerModule } from './jwt-manager/jwt-manager.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    JwtManagerModule,
    UsersModule,
    StorageModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
