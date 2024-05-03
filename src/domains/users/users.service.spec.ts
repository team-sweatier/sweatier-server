import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { StorageService } from 'src/storage/storage.service';
import { UsersService } from './users.service';

jest.mock('nanoid');
const nanoIdMock = jest.mocked(nanoid);

describe('유저 서비스 테스트', () => {
  let service: UsersService;
  let prismaServiceMock: DeepMockProxy<PrismaService>;
  let configServiceMock: DeepMockProxy<ConfigService>;
  let storageServiceMock: DeepMockProxy<StorageService>;

  beforeAll(async () => {
    configServiceMock = mockDeep<ConfigService>();
    configServiceMock.get.mockImplementation((key) => {
      if (key === 'NANOID_SIZE') return 18;
      if (key === 'HASH_SALT') return '12';
    });
  });

  beforeEach(async () => {
    prismaServiceMock = mockDeep<PrismaService>();
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

  describe('signUpUserData', () => {
    test('should generate user data for sign up', async () => {
      const signUpUserDto = {
        email: 'test@example.com',
        password: 'securePassword123!',
      };

      const expectedId = 'uniqueId123';

      nanoIdMock.mockReturnValue(expectedId);

      const result = await service.signUpUserData(signUpUserDto);
      delete result.encryptedPassword;

      expect(result).toStrictEqual({
        id: expectedId,
        email: signUpUserDto.email,
      });
    });
  });
});
