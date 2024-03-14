import { ConfigService } from '@nestjs/config';

export abstract class StorageService {
  constructor(readonly configService: ConfigService) {}

  abstract uploadImage(id: string, file: Express.Multer.File): Promise<string>;
  abstract deleteImage(id: string): Promise<void>;

  getExt(file: Pick<Express.Multer.File, 'originalname'>) {
    return file.originalname.split('.').pop();
  }
}
