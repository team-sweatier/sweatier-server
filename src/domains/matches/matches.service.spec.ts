import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { MatchesService } from './matches.service';
import { nanoid } from 'nanoid';
import { plainToInstance } from 'class-transformer';
import { CreateMatchDto, UpdateMatchDto } from './matches.dto';
import UserProfileNotFoundException from '../users/exceptions/user-profile-not-found.exception';
import MatchNotFoundException from './exceptions/match-not-found.exception';
import MatchEditForbiddenException from './exceptions/match-edit-forbidden.exception';
import MatchTierMismatchException from './exceptions/match-tier-mismatch.exception';
import MatchSelfParticipationException from './exceptions/match-self-participation.exception';
import MatchParticipationExpiredException from './exceptions/match-participation-expired.exception';

describe('MatchesService', () => {
  let matchService: MatchesService;
  const prismaClient: PrismaClient = new PrismaClient();
  let configMock: DeepMockProxy<ConfigService>;

  let userId: any;
  let matchData: any;
  let userProfile: any;
  let sportType: any;
  let tier: any;
  let createdMatch: any;

  beforeEach(async () => {
    configMock = mockDeep<ConfigService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        {
          provide: PrismaService,
          useValue: prismaClient,
        },
        {
          provide: ConfigService,
          useValue: configMock,
        },
      ],
    }).compile();

    matchService = module.get<MatchesService>(MatchesService);
  });

  beforeAll(async () => {
    await prismaClient.$connect();

    userId = nanoid();
    const currentDate = new Date();
    matchData = plainToInstance(CreateMatchDto, {
      title: '테스트 경기',
      content: '테스트 내용',
      gender: 'both',
      sportsTypeName: '축구',
      capability: 6,
      matchDay: new Date(currentDate.getDate() + 1),
    });

    userProfile = {
      userId,
      nickName: 'testUser',
      gender: 'male',
      phoneNumber: '010-1234-5678',
      bankName: 'KB',
      accountNumber: '123-456-7890',
      oneLiner: '안녕하세요',
      imageUrl: 'testImageUrl',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    sportType = {
      id: 1,
      name: '축구',
      rules: '기본 규칙',
    };

    tier = {
      id: 1,
      value: 'beginner',
      sportsTypeId: 1,
    };

    createdMatch = {
      id: nanoid(),
      hostId: userId,
      title: matchData.title,
      content: matchData.content,
      gender: matchData.gender,
      sportsTypeId: sportType.id,
      tierId: tier.id,
      participants: [{ id: userId }],
    };
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
  });

  describe('createMatch', () => {
    test('성공적으로 모집글을 생성한다', async () => {
      jest
        .spyOn(prismaClient.userProfile, 'findUnique')
        .mockResolvedValue({ ...userProfile, nickNameUpdatedAt: new Date() });
      jest
        .spyOn(prismaClient.sportsType, 'findUnique')
        .mockResolvedValue(sportType);
      jest.spyOn(prismaClient.user, 'findUnique').mockResolvedValue({
        id: userId,
        tiers: [tier],
      } as any);
      jest.spyOn(prismaClient.match, 'create').mockResolvedValue(createdMatch);

      const result = await matchService.createMatch(userId, matchData);

      expect(result).toEqual(createdMatch);
      expect(prismaClient.match.create).toHaveBeenCalledWith({
        data: {
          title: matchData.title,
          content: matchData.content,
          gender: matchData.gender,
          id: expect.any(String),
          matchDay: expect.any(Date),
          hostId: userId,
          sportsTypeId: sportType.id,
          tierId: tier.id,
          capability: matchData.capability,
          participants: {
            connect: {
              id: userId,
            },
          },
        },
        select: {
          id: true,
          hostId: true,
        },
      });
    });

    test('사용자 프로필이 존재하지 않을 경우 모집글을 작성할 수 없다', async () => {
      const userId = 'nonexistent-user';
      const matchData = new CreateMatchDto();
      jest
        .spyOn(prismaClient.userProfile, 'findUnique')
        .mockResolvedValue(null);

      await expect(matchService.createMatch(userId, matchData)).rejects.toThrow(
        UserProfileNotFoundException,
      );
    });
  });

  describe('deleteMatch', () => {
    test('모집글을 성공적으로 삭제한다', async () => {
      jest.spyOn(matchService, 'findMatch').mockResolvedValue(createdMatch);
      jest.spyOn(prismaClient.match, 'delete').mockResolvedValue(createdMatch);

      const result = await matchService.deleteMatch(userId, createdMatch.id);
      expect(prismaClient.match.delete).toHaveBeenCalledWith({
        where: { id: createdMatch.id },
      });
      expect(result).toEqual(createdMatch);
    });

    test('존재하지 않는 모집글은 삭제할 수 없다', async () => {
      jest.spyOn(matchService, 'findMatch').mockImplementation(() => {
        throw new MatchNotFoundException();
      });
      const dummyId = 'not_existing_match';
      await expect(matchService.deleteMatch(userId, dummyId)).rejects.toThrow(
        MatchNotFoundException,
      );
    });

    test('작성자가 아닌 경우 모집글을 삭제할 수 없다', async () => {
      jest.spyOn(matchService, 'findMatch').mockResolvedValue(createdMatch);
      jest.spyOn(prismaClient.match, 'delete').mockResolvedValue(createdMatch);

      const dummyId = 'not_existing_user';
      await expect(
        matchService.deleteMatch(dummyId, createdMatch.id),
      ).rejects.toThrow(MatchEditForbiddenException);
    });
  });

  describe('editMatch', () => {
    const updateMatchData = plainToInstance(UpdateMatchDto, {
      title: 'new_title',
    });

    test('모집글을 성공적으로 수정할 수 있다', async () => {
      const updatedMatch = { ...createdMatch, title: 'new_title' };
      jest.spyOn(matchService, 'editMatch').mockResolvedValue(updatedMatch);

      const result = await matchService.editMatch(
        userId,
        createdMatch.id,
        updateMatchData,
      );

      expect(matchService.editMatch).toHaveBeenCalledWith(
        userId,
        createdMatch.id,
        updateMatchData,
      );
      expect(result).toEqual(updatedMatch);
    });

    test('존재하지 않는 모집글은 수정할 수 없다', async () => {
      jest.spyOn(matchService, 'findMatch').mockImplementation(() => {
        throw new MatchNotFoundException();
      });
      const dummyId = 'not_existing_match';
      await expect(
        matchService.editMatch(userId, dummyId, updateMatchData),
      ).rejects.toThrow(MatchNotFoundException);
    });

    test('작성자가 아닌 경우 모집글을 수정할 수 없다', async () => {
      jest.spyOn(matchService, 'findMatch').mockResolvedValue(createdMatch);
      jest.spyOn(prismaClient.match, 'update').mockResolvedValue(createdMatch);

      const dummyId = 'not_existing_user';
      await expect(
        matchService.editMatch(dummyId, createdMatch.id, updateMatchData),
      ).rejects.toThrow(MatchEditForbiddenException);
    });
  });

  describe('validateParticipation', () => {
    const newUserId = nanoid();

    test('모든 조건에 부합하는 경우 신청할 수 있다', async () => {
      jest.spyOn(matchService, 'findMatch').mockResolvedValue(createdMatch);
      jest.spyOn(prismaClient.match, 'findUnique').mockResolvedValue({
        ...createdMatch,
        participants: [{ id: newUserId }],
      });

      await expect(
        matchService.participate(createdMatch.id, newUserId),
      ).resolves.not.toThrow();
    });

    test('티어가 다른 경우 경기 신청을 할 수 없다', async () => {
      const differentTierMatch = { ...createdMatch, tierId: 'differentTierId' };
      jest
        .spyOn(matchService, 'findMatch')
        .mockResolvedValue(differentTierMatch);
      await expect(
        matchService.participate(createdMatch.id, newUserId),
      ).rejects.toThrow(MatchTierMismatchException);
    });

    test('자신이 작성한 모집글에는 신청할 수 없다', async () => {
      jest
        .spyOn(matchService, 'findMatch')
        .mockResolvedValue({ ...createdMatch, hostId: newUserId });
      await expect(
        matchService.participate(createdMatch.id, newUserId),
      ).rejects.toThrow(MatchSelfParticipationException);
    });

    test('이미 지난 날짜의 경기에는 신청할 수 없다', async () => {
      const pastMatch = {
        ...createdMatch,
        matchDay: new Date(Date.now() - 86400000),
      };
      jest.spyOn(matchService, 'findMatch').mockResolvedValue(pastMatch);
      await expect(
        matchService.participate(pastMatch.id, newUserId),
      ).rejects.toThrow(MatchParticipationExpiredException);
    });
  });
});
