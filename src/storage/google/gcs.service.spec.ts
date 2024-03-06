import { Test, TestingModule } from '@nestjs/testing';
import { GCSService } from './gcs.service';

describe('GoogleCloudStorageService', () => {
  let service: GCSService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GCSService],
    }).compile();

    service = module.get<GCSService>(GCSService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
