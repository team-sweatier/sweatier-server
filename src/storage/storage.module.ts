import { Module } from '@nestjs/common';
import { S3Service } from './amazon/s3.service';
import { GCSService } from './google/gcs.service';
import { StorageService } from './storage.service';

@Module({
  providers: [
    S3Service,
    GCSService,
    { provide: StorageService, useClass: GCSService },
  ],
  exports: [S3Service, GCSService, StorageService],
})
export class StorageModule {}
