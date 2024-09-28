import { Module } from '@nestjs/common';
import { S3Service } from './amazon/s3.service';
import { StorageService } from './storage.service';

@Module({
  providers: [S3Service, { provide: StorageService, useClass: S3Service }],
  exports: [S3Service, StorageService],
})
export class StorageModule {}
