import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { nanoid } from 'nanoid';
import { PrismaService } from 'src/database/prisma/prisma.service';

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

  async findProfileByUserId(userId: string) {
    return await this.prismaService.userProfile.findUnique({
      where: { userId },
    });
  }

  async validateUsersCredential(user: User, signInDto: SignInUserDto) {
    if (!user) throw false;

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

  async createProfile(userId: string, createProfileDto: CreateProfileDto) {
    const profile = await this.prismaService.userProfile.create({
      data: {
        userId,
        ...createProfileDto,
      },
    });
    return profile;
  }

  async editProfile(userId: string, editProfileDto: EditProfileDto) {
    const isNicknameUpdated = editProfileDto.nickName !== undefined;

    const data = {
      ...editProfileDto,
      ...(isNicknameUpdated && {
        nickNameUpdatedAt: dayUtil.day().add(30, 'day').toDate(),
        // nickNameUpdatedAt: day().add(30, 'day').toDate(),
      }),
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

    return { id, email: signUpUserDto.email, encryptedPassword };
  }

  async getAppliedMatches(userId: string, timePassed: boolean) {
    const now = new Date();
    const matchDayCondition = timePassed ? { lte: now } : { gt: now };

    const user = await this.prismaService.user.findMany({
      where: {
        id: userId,
      },
      include: {
        participatingMatches: {
          where: {
            matchDay: matchDayCondition,
          },
        },
      },
    });

    return user.length > 0 ? user[0].participatingMatches : [];
  }
}
