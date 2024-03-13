import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Match, User } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { nanoid } from 'nanoid';
import { PrismaService } from 'src/database/prisma/prisma.service';

import { StorageService } from 'src/storage/storage.service';
import { dayUtil } from 'src/utils/day';
import { NOT_FOUND_SPORT_TYPE } from './users-error.messages';
import {
  CreateProfileDto,
  EditFavoriteDto,
  EditProfileDto,
  SignInUserDto,
  SignUpKakaoUserDto,
  SignUpUserDto,
} from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
  ) {}

  async findUserById(id: string) {
    return await this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async findUserByEmail(userEmail: string) {
    return await this.prismaService.user.findUnique({
      where: { email: userEmail },
    });
  }

  async findProfileByNickname(userNickName: string) {
    return await this.prismaService.userProfile.findUnique({
      where: { nickName: userNickName },
    });
  }

  async findProfileByPhoneNumber(userPhoneNumber: string) {
    return await this.prismaService.userProfile.findUnique({
      where: { phoneNumber: userPhoneNumber },
    });
  }

  async findProfileByUserId(userId: string) {
    return await this.prismaService.userProfile.findUnique({
      where: { userId },
    });
  }

  async validateUsersCredential(user: User, signInDto: SignInUserDto) {
    const passwordMatch = await compare(
      signInDto.password,
      user.encryptedPassword,
    );

    return passwordMatch;
  }

  async getUserTier(userId: string) {
    return await this.prismaService.user.findUnique({
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
  }

  async createUser(signUpUserDto: SignUpUserDto | SignUpKakaoUserDto) {
    const beginnerTiers = await this.prismaService.tier.findMany({
      where: { value: 'beginner' },
    });

    const connectTiers = beginnerTiers.map((tier) => ({
      id: tier.id,
    }));

    const signUpUserData =
      signUpUserDto instanceof SignUpKakaoUserDto
        ? { id: signUpUserDto.id }
        : await this.signUpUserData(signUpUserDto);

    const newUser = await this.prismaService.user.upsert({
      where: { id: signUpUserData.id },
      update: {},
      create: {
        ...signUpUserData,
        tiers: {
          connect: connectTiers,
        },
      },
    });

    return newUser;
  }

  async createProfile(
    userId: string,
    createProfileDto: CreateProfileDto,
    file?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined;
    if (file) {
      imageUrl = await this.storageService.uploadImage(userId, file);
    }
    const profile = await this.prismaService.userProfile.create({
      data: {
        userId,
        ...createProfileDto,
      },
    });
    return { profile, imageUrl };
  }

  async editProfile(
    userId: string,
    editProfileDto: EditProfileDto,
    file?: Express.Multer.File,
  ) {
    const isNicknameUpdated = editProfileDto.nickName !== undefined;

    let imageUrl: string | undefined;
    if (file) {
      imageUrl = await this.storageService.uploadImage(userId, file);
    }

    const data = {
      ...editProfileDto,
      ...(isNicknameUpdated && {
        nickNameUpdatedAt: dayUtil.day().add(30, 'day').toDate(),
      }),
    };

    const editedProfile = await this.prismaService.userProfile.update({
      where: { userId },
      data,
    });
    return { editedProfile, imageUrl };
  }

  async editUserFavorite(userId: string, editFavoriteDto: EditFavoriteDto) {
    const sportsTypes = await this.prismaService.sportsType.findMany({
      where: {
        name: { in: editFavoriteDto.sportsType },
      },
    });

    if (sportsTypes.length !== editFavoriteDto.sportsType.length) {
      //DTO 의 스포츠 타입이 DB의 스포츠 타입 시드데이터에 다 일치하게 존재하는지 검사
      throw new NotFoundException(NOT_FOUND_SPORT_TYPE);
    } else {
      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          likedSportsTypes: {
            connect: sportsTypes.map((type) => ({ id: type.id })),
          },
        },
      });
      return sportsTypes;
    }
  }

  private async signUpUserData(signUpUserDto: SignUpUserDto) {
    const id = nanoid(this.configService.get('NANOID_SIZE'));

    const encryptedPassword = await hash(
      signUpUserDto.password,
      parseInt(this.configService.get('HASH_SALT')),
    );

    return {
      id,
      email: signUpUserDto.email,
      encryptedPassword,
    };
  }

  /**
   * 1. 유저가 참가했던 매치를 모두 불러와.
   * 2. 가장 최근 매치를 찾아.
   * 3. 여기에 평가를 했는지를 찾아. 있으면 true/ 평가를 안했으면 false
   *  */
  async getUserLatestMatch(userId: string) {
    const nowDate = new Date();
    const latestMatch = await this.prismaService.match.findFirst({
      where: {
        participants: {
          some: {
            id: userId,
          },
        },
        matchDay: { lt: nowDate },
      },
      orderBy: {
        matchDay: 'desc',
      },
    });
    return latestMatch;
  }

  async getHasUserRated(userId: string, latestMatch: Match) {
    const userRateInLatestMatch = await this.prismaService.rating.findFirst({
      where: {
        raterId: userId,
        matchId: latestMatch.id,
      },
    });
    const hasUserRated = !!userRateInLatestMatch;

    return hasUserRated;
  }

  async getUserMatchRates(userId: string, matchId: string) {
    const values = await this.prismaService.rating.findMany({
      where: {
        userId: userId,
        matchId: matchId,
      },
      select: {
        value: true,
        raterId: true,
      },
    });
    return values.length > 0 ? values : [];
  }
}
