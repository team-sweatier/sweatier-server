// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { StorageService } from '../storage.service';

// @Injectable()
// export class GCSService extends StorageService {
//   private bucket: Bucket;
//   private storage: Storage;

//   constructor(readonly configService: ConfigService) {
//     super(configService);

//     this.storage = new Storage({
//       projectId: this.configService.get('GCP_PROJECT_ID'),
//       credentials: {
//         client_email: this.configService.get('GCP_CLIENT_EMAIL'),
//         private_key: this.configService.get('GCP_PRIVATE_KEY'),
//       },
//     });

//     this.bucket = this.storage.bucket(
//       this.configService.get('GCS_BUCKET_NAME'),
//     );
//   }

//   async uploadImage(
//     fileName: string,
//     file: Pick<Express.Multer.File, 'originalname' | 'buffer'>,
//   ) {
//     if (!file) return undefined;

//     const bucketFile = this.bucket.file(fileName);

//     const ext = this.getExt(file);
//     await bucketFile.save(file.buffer, {
//       public: true,
//       contentType: `image/${ext}`,
//     });

//     return `https://storage.googleapis.com/${this.configService.get('GCS_BUCKET_NAME')}/${fileName}`;
//   }

//   async deleteImage(fileName: string) {
//     const bucketFile = this.bucket.file(fileName);
//     console.log(await bucketFile.delete());
//   }
// }
