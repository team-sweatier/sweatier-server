import {
  BadRequestException,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { nanoid } from 'nanoid';
import { S3Service } from './storage/amazon/s3.service';

@Controller()
export class AppController {
  constructor(
    private readonly s3Service: S3Service,
    private configService: ConfigService,
  ) {}

  @Get('health-check')
  getHello(): string {
    return 'OK';
  }

  @Post('images')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File not found');

    const fileName = nanoid(this.configService.get('NANOID_SIZE'));

    return await this.s3Service.uploadImage(fileName, file);
  }
}
