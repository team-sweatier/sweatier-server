import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { nanoid } from 'nanoid';
import { PrismaService } from 'src/database/prisma/prisma.service';

import { SignInUserDto, SignUpUserDto } from './users.dto';

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

  async validateUsersCredential(user: User, signInDto: SignInUserDto) {
    if (!user) throw false;

    const passwordMatch = await compare(
      signInDto.password,
      user.encryptedPassword,
    );

    return passwordMatch;
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
}
