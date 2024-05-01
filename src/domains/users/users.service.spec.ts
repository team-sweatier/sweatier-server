import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { StorageService } from 'src/storage/storage.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaServiceMock: DeepMockProxy<PrismaService>;
  let configServiceMock: DeepMockProxy<ConfigService>;
  let storageServiceMock: DeepMockProxy<StorageService>;

  beforeEach(async () => {
    prismaServiceMock = mockDeep<PrismaService>();
    configServiceMock = mockDeep<ConfigService>();
    storageServiceMock = mockDeep<StorageService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: StorageService, useValue: storageServiceMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  test('Service should be defined', () => {
    expect(service).toBeDefined();
  });
});
