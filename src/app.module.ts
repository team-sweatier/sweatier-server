import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma/prisma.module';
import { AmazonS3Module } from './storage/amazon-s3/amazon-s3.module';
import { JwtManagerModule } from './jwt-manager/jwt-manager.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AmazonS3Module,
    JwtManagerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
