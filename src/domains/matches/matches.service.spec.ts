import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { MatchesService } from './matches.service';

describe('MatchesService', () => {
  let service: MatchesService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let configMock: DeepMockProxy<ConfigService>;

  beforeEach(async () => {
    console.log(__dirname);

    prismaMock = mockDeep<PrismaClient>();
    configMock = mockDeep<ConfigService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        {
          provide: PrismaService,

          useValue: prismaMock,
        },
        {
          provide: ConfigService,

          useValue: configMock,
        },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
  });

  test('should be defined', () => {
    expect(service).toBeDefined();
  });
});
