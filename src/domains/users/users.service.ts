import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Match, Prisma } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { nanoid } from 'nanoid';
import { PrismaService } from 'src/database/prisma/prisma.service';

import { StorageService } from 'src/storage/storage.service';
import { dayUtil } from 'src/utils/day';
import UserDuplicateNicknameException from './exceptions/user-duplicate-nickname.exception';
import UserDuplicatePhoneNumberException from './exceptions/user-duplicate-phone-number.exception';
import UserDuplicateProfileException from './exceptions/user-duplicate-profile.exception';
import UserDuplicateException from './exceptions/user-duplicate.exception';
import UserInvalidNicknameChangeException from './exceptions/user-invalid-nickname-change.exception';
import UserProfileNotFoundException from './exceptions/user-profile-not-found.exception';
import UserSportTypeNotFoundException from './exceptions/user-sport-type-not-found.exception';
import UserUnauthorizedException from './exceptions/user-unauthorized.exception';
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

  async findProfileByUserId(userId: string) {
    const profile = await this.prismaService.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) throw new UserProfileNotFoundException();

    return profile;
  }

  async validateProfile(userId: string, profileDto: CreateProfileDto) {
    const profile = await this.prismaService.userProfile.findUnique({
      where: { userId },
    });

    if (profile) throw new UserDuplicateProfileException();

    await this.validatePhoneNumber(profileDto.phoneNumber);

    await this.validateNickname(profileDto.nickName);
  }

  async validatePhoneNumber(userPhoneNumber: string) {
    const profile = await this.prismaService.userProfile.findUnique({
      where: { phoneNumber: userPhoneNumber },
    });

    if (profile) throw new UserDuplicatePhoneNumberException();
  }

  async validateNickname(userNickName: string) {
    const profile = await this.prismaService.userProfile.findUnique({
      where: { nickName: userNickName },
    });

    if (profile) throw new UserDuplicateNicknameException();
  }

  async validateNicknameChange(
    existingProfile: Prisma.UserProfileCreateWithoutUserInput,
    newNickname: string,
  ) {
    const originalNickname = existingProfile.nickName;
    const nickNameUpdatedAt = existingProfile.nickNameUpdatedAt;

    if (originalNickname === newNickname || !nickNameUpdatedAt) return;

    const daysSinceLastUpdate = dayUtil
      .day()
      .diff(dayUtil.day(nickNameUpdatedAt), 'day');

    if (daysSinceLastUpdate < 30)
      throw new UserInvalidNicknameChangeException();

    await this.validateNickname(newNickname);
  }

  async validateEmail(userEmail: string) {
    const duplicateUser = await this.prismaService.user.findUnique({
      where: { email: userEmail },
    });

    if (duplicateUser) throw new UserDuplicateException();
  }

  async findUsersCredential(signInDto: SignInUserDto) {
    const foundUser = await this.prismaService.user
      .findUniqueOrThrow({
        where: { email: signInDto.email },
      })
      .catch(() => {
        throw new UserUnauthorizedException();
      });

    const passwordMatch = await compare(
      signInDto.password,
      foundUser.encryptedPassword,
    );

    if (!passwordMatch) throw new UserUnauthorizedException();

    return foundUser;
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
    await this.validateProfile(userId, createProfileDto);

    const imageUrl = await this.storageService.uploadImage(
      nanoid(this.configService.get('NANOID_SIZE')),
      file,
    );

    const profile = await this.prismaService.userProfile.create({
      data: {
        userId,
        ...createProfileDto,
        ...(imageUrl && { imageUrl }),
      },
    });

    return profile;
  }

  async editProfile(
    userId: string,
    editProfileDto: EditProfileDto,
    file?: Express.Multer.File,
  ) {
    const { nickName: newNickname, phoneNumber: newPhoneNumber } =
      editProfileDto;

    const existingProfile = await this.findProfileByUserId(userId);

    await this.validateNicknameChange(existingProfile, newNickname);

    const originalPhoneNumber = existingProfile.phoneNumber;
    if (newPhoneNumber && originalPhoneNumber !== newPhoneNumber) {
      await this.validatePhoneNumber(newPhoneNumber);
    }

    const originalNickname = existingProfile.nickName;
    if (newNickname && newNickname !== originalNickname) {
      existingProfile.nickNameUpdatedAt = dayUtil.day().add(30, 'day').toDate();
    }

    const isNicknameUpdated = newNickname && newNickname !== originalNickname;

    const imageUrl = await this.storageService.uploadImage(
      nanoid(this.configService.get('NANOID_SIZE')),
      file,
    );

    const data = {
      ...editProfileDto,
      ...(isNicknameUpdated && {
        nickNameUpdatedAt: dayUtil.day().add(30, 'day').toDate(),
      }),
      ...(imageUrl && { imageUrl }),
    };

    const editedProfile = await this.prismaService.userProfile.update({
      where: { userId },
      data,
    });

    return editedProfile;
  }

  async editUserFavorite(userId: string, editFavoriteDto: EditFavoriteDto) {
    const sportsTypes = await this.prismaService.sportsType.findMany({
      where: {
        name: { in: editFavoriteDto.sportsType },
      },
    });

    if (sportsTypes.length !== editFavoriteDto.sportsType.length) {
      throw new UserSportTypeNotFoundException();
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
