import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { AccountType } from 'src/domains/users/user.type';
import { JwtExpiredException } from './exceptions/jwt-expired.exception';

@Injectable()
export class JwtManagerService implements OnModuleInit {
  secretKey: string | undefined;
  constructor(private readonly configService: ConfigService) {}
  onModuleInit() {
    this.secretKey = this.configService.get('JWT_SECRET');
  }

  sign(accountType: AccountType, { id, email }: Pick<User, 'id' | 'email'>) {
    return sign({ accountType, email }, this.secretKey, {
      subject: id,
      expiresIn: '2h',
    });
  }
  async verifyAccessToken(accessToken: string) {
    try {
      const { sub: id, accountType } = verify(
        accessToken,
        this.secretKey,
      ) as JwtPayload;
      return { id, accountTypeOfToken: accountType };
    } catch (e) {
      throw new JwtExpiredException();
    }
  }
}
