import { Test, TestingModule } from '@nestjs/testing';
import { KakaoAuthService } from './kakao-auth.service';

describe('KakaoAuthService', () => {
  let service: KakaoAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KakaoAuthService],
    }).compile();

    service = module.get<KakaoAuthService>(KakaoAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
