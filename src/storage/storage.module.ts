import { Module } from '@nestjs/common';
import { S3Service } from './amazon/s3.service';
import { GCSService } from './google/gcs.service';

@Module({
  providers: [S3Service, GCSService],
  exports: [S3Service, GCSService],
})
export class StorageModule {}
