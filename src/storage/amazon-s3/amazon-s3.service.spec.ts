import { Test, TestingModule } from '@nestjs/testing';
import { AmazonS3Service } from './amazon-s3.service';

describe('AmazonS3Service', () => {
  let service: AmazonS3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AmazonS3Service],
    }).compile();

    service = module.get<AmazonS3Service>(AmazonS3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
