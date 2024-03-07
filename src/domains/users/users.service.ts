import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { nanoid } from 'nanoid';
import { PrismaService } from 'src/database/prisma/prisma.service';

import dayUtil from 'src/utils/day';
import { NOT_FOUND_SPORT_TYPE } from './users-error.messages';
import {
  CreateProfileDto,
  EditFavoriteDto,
  EditProfileDto,
  SignInUserDto,
  SignUpUserDto,
} from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

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
          select: { value: true, sportType: { select: { name: true } } },
        },
      },
    });
  }

  async createUser(signUpUserDto: SignUpUserDto) {
    const id = nanoid(this.configService.get('NANOID_SIZE'));

    const encryptedPassword = await hash(
      signUpUserDto.password,
      parseInt(this.configService.get('HASH_SALT')),
    );

    const beginnerTiers = await this.prismaService.tier.findMany({
      where: { value: 'beginner' },
    });

    const connectTiers = beginnerTiers.map((tier) => ({
      id: tier.id,
    }));

    const newUser = await this.prismaService.user.create({
      data: {
        id,
        email: signUpUserDto.email,
        encryptedPassword: encryptedPassword,
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
        name: { in: editFavoriteDto.sportType },
      },
    });

    if (sportsTypes.length !== editFavoriteDto.sportType.length) {
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
}
