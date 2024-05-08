import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Match, Prisma, PrismaClient, User, UserProfile } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import * as nanoid from 'nanoid';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { StorageService } from 'src/storage/storage.service';
import UserDuplicateNicknameException from './exceptions/user-duplicate-nickname.exception';
import UserDuplicatePhoneNumberException from './exceptions/user-duplicate-phone-number.exception';
import UserDuplicateProfileException from './exceptions/user-duplicate-profile.exception';
import UserDuplicateException from './exceptions/user-duplicate.exception';
import UserInvalidNicknameChangeException from './exceptions/user-invalid-nickname-change.exception';
import { UserLatestMatchNotFoundException } from './exceptions/user-latest-match-not-found';
import { UserMatchNotFoundException } from './exceptions/user-match-not-found.exception';
import UserProfileNotFoundException from './exceptions/user-profile-not-found.exception';
import UserSportTypeNotFoundException from './exceptions/user-sport-type-not-found.exception';
import UserUnauthorizedException from './exceptions/user-unauthorized.exception';
import {
  CreateProfileDto,
  EditProfileDto,
  SignInUserDto,
  SignUpKakaoUserDto,
  SignUpUserDto,
} from './users.dto';
import { UsersService } from './users.service';

describe('유저 서비스 테스트', () => {
  let service: UsersService;
  const prismaService: PrismaClient = new PrismaClient();
  let configService: DeepMockProxy<ConfigService>;
  let storageService: DeepMockProxy<StorageService>;

  const userData: User = {
    id: 'definedId',
    email: 'example@naver.com',
    encryptedPassword: 'encryptedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const userProfileData: UserProfile = {
    userId: userData.id,
    gender: 'male',
    phoneNumber: '010-1234-5678',
    nickName: 'nickname',
    nickNameUpdatedAt: new Date(),
    oneLiner: '안녕하세요!',
    bankName: 'Bank',
    accountNumber: '123-456-789',
    imageUrl: 'imageUrl',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const matchData: Match = {
    id: 'matchId',
    hostId: 'hostId',
    address: 'address',
    capability: 8,
    content: 'content',
    gender: 'male',
    latitude: 37.5663,
    longitude: 127.0998,
    placeName: 'placeName',
    sportsTypeId: 1,
    tierId: 'tierId',
    title: 'title',
    region: 'region',
    matchDay: new Date(new Date().setDate(new Date().getDate() - 2)),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 3)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 3)),
  };

  beforeAll(async () => {
    await prismaService.$connect();

    storageService = mockDeep<StorageService>();
    storageService.uploadImage.mockResolvedValue('imageUrl');

    configService = mockDeep<ConfigService>();
    configService.get.mockImplementation((key) => {
      const configOptions = {
        NANOID_SIZE: 18,
        HASH_SALT: '12',
      };
      return configOptions[key];
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaService },
        { provide: ConfigService, useValue: configService },
        { provide: StorageService, useValue: storageService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(async () => {
    await prismaService.userProfile.deleteMany({});
    await prismaService.user.deleteMany({});
    await prismaService.tier.deleteMany({});
    await prismaService.sportsType.deleteMany({});
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  describe('findUserById', () => {
    beforeEach(() => jest.spyOn(service, 'findUserById'));
    afterEach(() => jest.clearAllMocks());

    test('존재하는 id 값을 가진 유저는 조회할 수 있어야 한다.', async () => {
      const newUser = await prismaService.user.create({ data: userData });
      const foundUser = await service.findUserById(userData.id);

      expect(newUser).toStrictEqual(foundUser);
      expect(service.findUserById).toHaveBeenCalledTimes(1);
    });

    test('존재하지 않는 id 값을 가진 유저는 null 값이 반환되어야 한다.', async () => {
      const user = await service.findUserById('undefinedId');

      expect(user).toBeNull();
      expect(service.findUserById).toHaveBeenCalledTimes(1);
    });
  });

  describe('findProfileByUserId', () => {
    beforeEach(async () => {
      await prismaService.user.create({ data: userData });

      jest.spyOn(service, 'findProfileByUserId');
    });

    afterEach(async () => {
      jest.clearAllMocks();
    });

    test('프로필이 있는 userId로 프로필 조회시', async () => {
      await prismaService.userProfile.create({
        data: userProfileData,
      });

      const userProfile = await service.findProfileByUserId('definedId');
      const expectedUserProfile = {
        ...userProfileData,
        nickNameUpdatedAt: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      expect(userProfile).toStrictEqual(expectedUserProfile);
      expect(service.findProfileByUserId).toHaveBeenCalledTimes(1);
    });

    test('프로필이 없는 userId로 프로필 조회시 UserProfileNotFoundException 발생', async () => {
      await expect(service.findProfileByUserId('definedId')).rejects.toThrow(
        UserProfileNotFoundException,
      );
      expect(service.findProfileByUserId).toHaveBeenCalledTimes(1);
    });

    test('존재하지 않는 userId로 프로필 조회시 UserProfileNotFoundException 발생', async () => {
      await expect(service.findProfileByUserId('undefinedId')).rejects.toThrow(
        UserProfileNotFoundException,
      );
      expect(service.findProfileByUserId).toHaveBeenCalledTimes(1);
    });
  });

  describe('findUsersCredential', () => {
    let signInUserDto: SignInUserDto;

    beforeAll(() =>
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation((password, encryptedPassword) => {
          return password === encryptedPassword
            ? Promise.resolve(true)
            : Promise.resolve(false);
        }),
    );

    beforeEach(async () => {
      signInUserDto = plainToInstance(SignInUserDto, {
        email: userData.email,
        password: userData.encryptedPassword,
      });

      await prismaService.user.create({ data: userData });
    });

    test('이메일, 패스워드가 일치하는 경우 user 반환', async () => {
      const expectedUser = {
        ...userData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      const foundUser = await service.findUsersCredential(signInUserDto);

      expect(foundUser).toStrictEqual(expectedUser);
    });

    test('존재하지 않는 이메일인 경우 UserUnauthorizedException 발생', async () => {
      signInUserDto.email = 'undefined@naver.com';

      await expect(service.findUsersCredential(signInUserDto)).rejects.toThrow(
        UserUnauthorizedException,
      );
    });

    test('패스워드가 일치하지 않는 경우 UserUnauthorizedException 발생', async () => {
      signInUserDto.password = 'invalidPassword';

      await expect(service.findUsersCredential(signInUserDto)).rejects.toThrow(
        UserUnauthorizedException,
      );
    });
  });

  describe('getUserTier', () => {
    test('유저 ID로 유저의 티어 정보를 가져온다', async () => {
      const userId = 'someUserId';
      const mockTierData = {
        tiers: [
          {
            id: 'tierId1',
            value: 'pro',
            sportType: {
              id: 'sportTypeId1',
              name: 'soccer',
            },
          },
        ],
      };

      jest.spyOn(prismaService.user, 'findUnique').mockImplementation(
        () =>
          Promise.resolve({
            tiers: [
              {
                id: 'tierId1',
                value: 'pro',
                sportType: {
                  id: 'sportTypeId1',
                  name: 'soccer',
                },
              },
            ],
          }) as any,
      );

      const result = await service.getUserTier(userId);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          tiers: {
            select: {
              id: true,
              value: true,
              sportType: { select: { id: true, name: true } },
            },
          },
        },
      });

      expect(result).toEqual(mockTierData);
    });

    test('유저 ID가 존재하지 않을 경우 null을 반환한다', async () => {
      const userId = 'nonExistentUserId';
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      const result = await service.getUserTier(userId);

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    beforeEach(() => {
      jest
        .spyOn(nanoid, 'nanoid')
        .mockImplementation((size: number) => 'definedId');

      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('encryptedPassword'));

      jest.spyOn(service, 'createUser');
      jest.spyOn(service, 'signUpUserData');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('신규 유저 생성 시 초보자 티어가 연결되어야 한다', async () => {
      const signUpUserDto = plainToInstance(SignUpUserDto, {
        email: userData.email,
        password: userData,
      });

      const expectedUser = {
        ...userData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      const actualUser = await service.createUser(signUpUserDto);

      expect(actualUser).toStrictEqual(expectedUser);
      expect(service.createUser).toHaveBeenCalledTimes(1);
      expect(service.signUpUserData).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
      expect(nanoid.nanoid).toHaveBeenCalledTimes(1);
    });

    test('카카오 유저 생성 시 ID만 사용하여 유저가 생성되어야 한다', async () => {
      const signUpKakaoUserDto = plainToInstance(SignUpKakaoUserDto, {
        id: 'kakaoId',
      });

      const expectedUser = {
        id: 'kakaoId',
        email: null,
        encryptedPassword: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      const actualUser = await service.createUser(signUpKakaoUserDto);

      expect(actualUser).toStrictEqual(expectedUser);
      expect(service.createUser).toHaveBeenCalledTimes(1);
      expect(service.signUpUserData).toHaveBeenCalledTimes(0);
      expect(bcrypt.hash).toHaveBeenCalledTimes(0);
      expect(nanoid.nanoid).toHaveBeenCalledTimes(0);
    });
  });

  describe('createProfile', () => {
    beforeEach(() => {
      jest.spyOn(service, 'createProfile');
      jest.spyOn(service, 'validateProfile');
      jest.spyOn(service, 'validatePhoneNumber');
      jest.spyOn(service, 'validateNickname');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('프로필이 없는 유저는 프로필이 생성되어야 한다', async () => {
      jest
        .spyOn(prismaService.userProfile, 'findUnique')
        .mockResolvedValue(null);

      jest
        .spyOn(prismaService.userProfile, 'create')
        .mockResolvedValue(userProfileData as any);

      const userProfileDto = plainToInstance(CreateProfileDto, userProfileData);

      const actualUserProfile = await service.createProfile(
        'definedId',
        userProfileDto,
      );

      const expectedUserProfile = {
        ...userProfileData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      expect(actualUserProfile).toStrictEqual(expectedUserProfile);
      expect(service.createProfile).toHaveBeenCalledTimes(1);
      expect(service.validateProfile).toHaveBeenCalledTimes(1);
      expect(service.validatePhoneNumber).toHaveBeenCalledTimes(1);
      expect(service.validateNickname).toHaveBeenCalledTimes(1);
    });

    test('프로필이 있는 id를 가진 유저는 UserDuplicateProfileException 예외가 발생해야 한다', async () => {
      jest
        .spyOn(prismaService.userProfile, 'findUnique')
        .mockImplementation((args) =>
          args.where.userId === 'definedId'
            ? (Promise.resolve(userProfileData) as any)
            : Promise.resolve(null),
        );

      const createUserProfileDto = plainToInstance(CreateProfileDto, {
        ...userProfileData,
      });

      await expect(
        service.createProfile('definedId', createUserProfileDto),
      ).rejects.toThrow(UserDuplicateProfileException);

      expect(service.createProfile).toHaveBeenCalledTimes(1);
      expect(service.validateProfile).toHaveBeenCalledTimes(1);
      expect(service.validatePhoneNumber).toHaveBeenCalledTimes(0);
      expect(service.validateNickname).toHaveBeenCalledTimes(0);
    });

    test('휴대폰 번호가 중복된 프로필이 데이터베이스 상에 있으면 UserDuplicatePhoneNumberException 예외가 발생해야 한다', async () => {
      jest
        .spyOn(prismaService.userProfile, 'findUnique')
        .mockImplementation((args) =>
          args.where.phoneNumber === userProfileData.phoneNumber
            ? (Promise.resolve(userProfileData) as any)
            : Promise.resolve(null),
        );

      const createUserProfileDto = plainToInstance(CreateProfileDto, {
        ...userProfileData,
      });

      await expect(
        service.createProfile('definedId', createUserProfileDto),
      ).rejects.toThrow(UserDuplicatePhoneNumberException);

      expect(service.createProfile).toHaveBeenCalledTimes(1);
      expect(service.validateProfile).toHaveBeenCalledTimes(1);
      expect(service.validatePhoneNumber).toHaveBeenCalledTimes(1);
      expect(service.validateNickname).toHaveBeenCalledTimes(0);
    });

    test('닉네임이 중복된 프로필이 데이터베이스 상에 있으면 UserDuplicateNicknameException 예외가 발생해야 한다', async () => {
      jest
        .spyOn(prismaService.userProfile, 'findUnique')
        .mockImplementation((args) =>
          args.where.nickName === userProfileData.nickName
            ? (Promise.resolve(userProfileData) as any)
            : Promise.resolve(null),
        );

      const createUserProfileDto = plainToInstance(CreateProfileDto, {
        ...userProfileData,
      });

      try {
        await service.createProfile('definedId', createUserProfileDto);
      } catch (e) {
        expect(e).toBeInstanceOf(UserDuplicateNicknameException);
      }

      expect(service.createProfile).toHaveBeenCalledTimes(1);
      expect(service.validateProfile).toHaveBeenCalledTimes(1);
      expect(service.validatePhoneNumber).toHaveBeenCalledTimes(1);
      expect(service.validateNickname).toHaveBeenCalledTimes(1);
    });
  });

  describe('validateNicknameChange', () => {
    beforeEach(() => {
      jest.spyOn(service, 'validateNicknameChange');
      jest.spyOn(service, 'validateNickname');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('닉네임이 변경되지 않은 경우 예외가 발생되지 않아야 한다,', () => {
      const existingProfile = {
        ...userProfileData,
      } as Prisma.UserProfileUncheckedCreateInput;
      const newNickname = existingProfile.nickName;

      expect(() =>
        service.validateNicknameChange(existingProfile, newNickname),
      ).not.toThrow();
      expect(service.validateNicknameChange).toHaveBeenCalledTimes(1);
      expect(service.validateNickname).toHaveBeenCalledTimes(0);
    });

    test('닉네임 업데이트 일자가 null인 경우 예외가 발생되지 않아야 한다', async () => {
      const existingProfile = {
        ...userProfileData,
        nickNameUpdatedAt: null,
      } as Prisma.UserProfileUncheckedCreateInput;

      const newNickname = 'newNickname';

      expect(() =>
        service.validateNicknameChange(existingProfile, newNickname),
      ).not.toThrow();
      expect(service.validateNicknameChange).toHaveBeenCalledTimes(1);
      expect(service.validateNickname).toHaveBeenCalledTimes(0);
    });

    test('닉네임 업데이트 일자가 30일이 되지 않은 경우 UserInvalidNicknameChangeException', async () => {
      const existingProfile = {
        ...userProfileData,
        nickNameUpdatedAt: new Date(
          new Date().getTime() - 29 * 24 * 60 * 60 * 1000,
        ),
      } as Prisma.UserProfileUncheckedCreateInput;

      const newNickname = 'newNickname';

      await expect(
        service.validateNicknameChange(existingProfile, newNickname),
      ).rejects.toThrow(UserInvalidNicknameChangeException);
      expect(service.validateNicknameChange).toHaveBeenCalledTimes(1);
      expect(service.validateNickname).toHaveBeenCalledTimes(0);
    });

    test(
      '닉네임 업데이트 일자가 30일 이후인데 이미 존재하는 ' +
        '닉네임인 경우 UserDuplicateNicknameException',
      async () => {
        jest
          .spyOn(prismaService.userProfile, 'findUnique')
          .mockImplementation((args) =>
            args.where.nickName === 'existingNickname'
              ? (Promise.resolve(userProfileData) as any)
              : Promise.resolve(null),
          );

        const existingProfile = {
          ...userProfileData,
          nickNameUpdatedAt: new Date(
            new Date().getTime() - 30 * 24 * 60 * 60 * 1000,
          ),
        } as Prisma.UserProfileUncheckedCreateInput;

        const newNickname = 'existingNickname';

        await expect(
          service.validateNicknameChange(existingProfile, newNickname),
        ).rejects.toThrow(UserDuplicateNicknameException);
      },
    );
  });

  describe('validateEmail', () => {
    test('중복 이메일이 아닌 경우 예외가 발생하지 않아야 한다', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      expect(() => service.validateEmail(userData.email)).not.toThrow();
    });

    test('중복 이메일인 경우 UserDuplicateEmailException 예외가 발생해야 한다', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(userData as any);

      try {
        await service.validateEmail(userData.email);
      } catch (e) {
        expect(e).toBeInstanceOf(UserDuplicateException);
      }
    });
  });

  describe('editProfile', () => {
    test('프로필이 업데이트되어야 한다', async () => {
      jest.spyOn(service, 'findProfileByUserId').mockResolvedValue({
        ...userProfileData,
        nickNameUpdatedAt: new Date(
          new Date().getTime() - 30 * 24 * 60 * 60 * 1000,
        ),
      } as any);

      jest
        .spyOn(prismaService.userProfile, 'update')
        .mockImplementation((args) => {
          const originalProfile = userProfileData;
          const updatedProfile = {
            ...originalProfile,
            ...args.data,
          };

          return Promise.resolve(updatedProfile) as any;
        });

      const editProfileDto = plainToInstance(EditProfileDto, {
        phoneNumber: '010-5678-1234',
      });

      const updatedProfile = await service.editProfile(
        'definedId',
        editProfileDto,
      );

      expect(updatedProfile).toStrictEqual({
        ...userProfileData,
        ...editProfileDto,
      });
    });
  });

  describe('editUserFavorite', () => {
    test('사용자가 좋아하는 스포츠 유형이 성공적으로 업데이트되어야 한다', async () => {
      const userId = 'someUserId';
      const editFavoriteDto = {
        sportsType: ['soccer', 'basketball'],
      };

      const sportsTypes = [
        { id: 1, name: 'badminton' },
        { id: 2, name: 'baseball' },
        { id: 3, name: 'tennis' },
        { id: 4, name: 'basketball' },
        { id: 5, name: 'soccer' },
      ];

      jest
        .spyOn(prismaService.sportsType, 'findMany')
        .mockImplementation(
          (args) =>
            Promise.resolve(
              sportsTypes.filter((sportType) =>
                args.where.name['in'].includes(sportType.name),
              ),
            ) as any,
        );

      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        id: userId,
        likedSportsTypes: sportsTypes as any,
      } as any);

      const expectedResult = [
        { id: 4, name: 'basketball' },
        { id: 5, name: 'soccer' },
      ];

      const actualResult = await service.editUserFavorite(
        userId,
        editFavoriteDto,
      );

      expect(actualResult).toEqual(expectedResult);
    });

    test(
      '사용자가 존재하지 않는 스포츠 유형을 선택한 경우 ' +
        'UserSportTypeNotFoundException 예외가 발생해야 한다',
      async () => {
        const userId = 'someUserId';
        const editFavoriteDto = {
          sportsType: ['surfing'],
        };

        jest.spyOn(prismaService.sportsType, 'findMany').mockResolvedValue([]);

        await expect(
          service.editUserFavorite(userId, editFavoriteDto),
        ).rejects.toThrow(UserSportTypeNotFoundException);
      },
    );
  });

  describe('getUserLatestMatch', () => {
    beforeAll(() => {
      jest
        .spyOn(prismaService.match, 'findFirst')
        .mockImplementation((args) => {
          return args.where.participants.some.id === 'participantId'
            ? (Promise.resolve(matchData) as any)
            : Promise.resolve(null);
        });
    });

    test('유저의 최근 매치를 가져온다', async () => {
      const userId = 'participantId';
      const result = await service.getUserLatestMatch(userId);

      expect(result).toStrictEqual(matchData);
    });

    test('유저의 최근 매치가 없는 경우 UserLatestMatchNotFoundException을 반환한다.', () => {
      const userId = 'nonParticipantId';
      const result = service.getUserLatestMatch(userId);

      expect(result).rejects.toThrow(UserLatestMatchNotFoundException);
    });
  });

  describe('getHasUserRated', () => {
    beforeAll(() => {
      jest
        .spyOn(prismaService.rating, 'findFirst')
        .mockImplementation((args) => {
          if (args.where.raterId !== 'ratedUserId')
            return Promise.resolve(null) as any;

          return Promise.resolve({
            id: 'ratingId',
            userId: 'ratedUserId',
            raterId: args.where.raterId,
            matchId: matchData.id,
            value: 5,
            createdAt: new Date(),
          });
        });
    });

    test('유저가 최근 매치에서 평가를 했다면 true를 반환한다', async () => {
      const ratedUserId = 'ratedUserId';

      const hasRated = await service.getHasUserRated(ratedUserId, matchData);

      expect(hasRated).toBeTruthy();
    });

    test('유저가 최근 매치에서 평가를 하지 않았다면 false를 반환한다', async () => {
      const unratedUserId = 'unratedUserId';

      const hasRated = await service.getHasUserRated(
        unratedUserId,
        matchData as any,
      );

      expect(hasRated).toBeFalsy();
    });
  });

  describe('getUserMatchRates', () => {
    const matchRatesMock: any[] = Array.from({
      length: 5,
    }).map((_, i) => {
      return {
        id: `ratingId${i}`,
        userId: 'ratedUserId',
        raterId: `raterId${i}`,
        matchId: 'matchId',
        value: 5,
        createdAt: new Date(),
      };
    });

    beforeAll(() => {
      jest
        .spyOn(prismaService.match, 'findUnique')
        .mockImplementation((args) => {
          if (args.where.id !== 'matchId') return Promise.resolve(null);

          return Promise.resolve(matchData) as any;
        });

      jest
        .spyOn(prismaService.rating, 'findMany')
        .mockImplementation((args) => {
          if (args.where.userId !== 'ratedUserId') return Promise.resolve([]);

          return Promise.resolve(matchRatesMock) as any;
        });
    });

    test('유저가 매치에서 평가를 받았다면 해당 평가 목록을 반환한다', async () => {
      const matchId = 'matchId';
      const userId = 'ratedUserId';

      const expectedRates = matchRatesMock;
      const actualRates = await service.getUserMatchRates(userId, matchId);

      expect(actualRates).toStrictEqual(expectedRates);
    });

    test('유저가 매치에서 평가를 받지 않았다면 빈 배열을 반환한다', async () => {
      const matchId = 'matchId';
      const userId = 'notRatedUserId';

      const actualRates = await service.getUserMatchRates(userId, matchId);

      expect(actualRates).toHaveLength(0);
    });

    test('매치가 존재하지 않을 경우 UserMatchNotFoundException을 반환한다', async () => {
      const userId = 'userId';
      const matchId = 'invalidMatchId';

      await expect(service.getUserMatchRates(userId, matchId)).rejects.toThrow(
        UserMatchNotFoundException,
      );
    });
  });
});
