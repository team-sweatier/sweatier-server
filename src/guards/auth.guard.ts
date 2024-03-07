import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtManagerService } from 'src/jwt-manager/jwt-manager.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { AccountType } from 'src/domains/users/user.type';

@Injectable()
export class AuthGuard implements CanActivate {
  accountTypeMap: Record<AccountType, { model: any; typeName: string }>;

  constructor(
    private readonly jwtManagerService: JwtManagerService,
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) {
    this.accountTypeMap = {
      user: { model: this.prismaService.user, typeName: 'user' },
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const accountTypeInDecorator =
      this.reflector.getAllAndOverride<AccountType>('accountType', [
        context.getHandler(),
        context.getClass(),
      ]);
    if (accountTypeInDecorator === undefined) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = request.cookies['accessToken'];

    if (!accessToken) throw new UnauthorizedException('LOGIN_REQUIRED');

    const { id, accountTypeOfToken } =
      await this.jwtManagerService.verifyAccessToken(accessToken);

    if (accountTypeInDecorator !== accountTypeOfToken)
      throw new ForbiddenException('NOT_ALLOWED_USER');

    const { model, typeName: accountType } =
      this.accountTypeMap[accountTypeInDecorator];

    await model
      .findUniqueOrThrow({
        where: { id },
      })
      .then((entity: any) => {
        request[accountType as AccountType] = entity;
      })
      .catch(() => {
        throw new UnauthorizedException('INVALID_USER');
      });

    return true;
  }
}