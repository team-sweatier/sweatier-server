import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../storage.service';

@Injectable()
export class S3Service extends StorageService {
  s3Client: S3Client;

  constructor(readonly configService: ConfigService) {
    super(configService);

    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadImage(fileName: string, file: Express.Multer.File) {
    const ext = this.getExt(file);

    const command = new PutObjectCommand({
      Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
      Key: fileName,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: `image/${ext}`,
    });

    await this.s3Client.send(command);

    return `https://s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${this.configService.get('AWS_S3_BUCKET_NAME')}/${fileName}`;
  }
}
