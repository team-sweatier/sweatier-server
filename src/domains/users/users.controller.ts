import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { CookieOptions, Response } from 'express';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { DAccount } from 'src/decorators/account.decorator';
import { Private } from 'src/decorators/private.decorator';
import { JwtManagerService } from 'src/jwt-manager/jwt-manager.service';
import { MatchesService } from '../matches/matches.service';
import { KakaoAuthService } from './kakao-auth/kakao-auth.service';
import {
  CreateProfileDto,
  EditFavoriteDto,
  EditProfileDto,
  SignInUserDto,
  SignUpKakaoUserDto,
  SignUpUserDto,
} from './users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  private readonly cookieOptions: CookieOptions;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtManagerService: JwtManagerService,
    private readonly kakaoAuthService: KakaoAuthService,
    private readonly configService: ConfigService,
    private readonly matchesService: MatchesService,
    private readonly prismaService: PrismaService,
  ) {
    this.cookieOptions = {
      httpOnly: true,
      maxAge: parseInt(this.configService.get('COOKIE_MAX_AGE')),
      sameSite: 'none',
      domain: this.configService.get('CLIENT_DOMAIN'),
      ...(this.configService.get('NODE_ENV') === 'production' && {
        secure: true,
      }),
    };
  }

  @Post('sign-up')
  async signUp(
    @Body() signUpDto: SignUpUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.usersService.validateEmail(signUpDto.email);

    const user = await this.usersService.createUser(signUpDto);

    const accessToken = this.jwtManagerService.sign('user', {
      id: user.id,
      email: user.email,
    });

    response.cookie('accessToken', accessToken, this.cookieOptions);

    return { accessToken };
  }

  @Post('sign-in')
  async signIn(
    @Body() signInDto: SignInUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const foundUser = await this.usersService.findUsersCredential(signInDto);

    const accessToken = this.jwtManagerService.sign('user', {
      id: foundUser.id,
      email: foundUser.email,
    });

    response.cookie('accessToken', accessToken, this.cookieOptions);

    return { accessToken };
  }

  @Get('sign-in/kakao')
  async signInKakao(@Res() response: Response) {
    response.redirect(this.kakaoAuthService.getKakaoAuthUrl());
  }

  @Get('sign-in/kakao/callback')
  async signInKakaoCallback(
    @Query('code') code: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const id = await this.kakaoAuthService.getKakaoUsersId(code);

    const user = await this.usersService.createUser(
      new SignUpKakaoUserDto(id as string),
    );

    const accessToken = this.jwtManagerService.sign('user', {
      id: user.id,
      email: user.email,
    });

    response.cookie('accessToken', accessToken, this.cookieOptions);
    return { accessToken };
  }

  @Private('user')
  @Delete('sign-out')
  async signOut(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('accessToken', this.cookieOptions);
    return;
  }

  @Private('user')
  @Get('refresh-token')
  async refresh(
    @DAccount('user') user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    const accessToken = this.jwtManagerService.sign('user', {
      id: user.id,
      email: user.email,
    });

    response.cookie('accessToken', accessToken, this.cookieOptions);

    return { accessToken };
  }

  @Private('user')
  @Post('profile')
  @UseInterceptors(FileInterceptor('file'))
  async createProfile(
    @Body() createProfileDto: CreateProfileDto,
    @DAccount('user') user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.usersService.createProfile(
      user.id,
      createProfileDto,
      file,
    );
  }

  @Private('user')
  @Get('profile')
  async getProfile(@DAccount('user') user: User) {
    return await this.usersService.findProfileByUserId(user.id);
  }

  @Private('user')
  @Put('profile')
  @UseInterceptors(FileInterceptor('file'))
  async editProfile(
    @Body() editProfileDto: EditProfileDto,
    @DAccount('user') user: User,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.usersService.editProfile(user.id, editProfileDto, file);
  }

  @Private('user')
  @Get('tier')
  async getUserTier(@DAccount('user') user: User) {
    return await this.usersService.getUserTier(user.id);
  }

  @Private('user')
  @Put('favorite')
  async editUserFavorite(
    @Body() editFavoriteDto: EditFavoriteDto,
    @DAccount('user') user: User,
  ) {
    return await this.usersService.editUserFavorite(user.id, editFavoriteDto);
  }

  @Private('user')
  @Get('matches')
  async getMatches(@DAccount('user') user: User) {
    return await this.matchesService.findParticipateMatches(user.id);
  }

  @Private('user')
  @Get('latest-rating')
  async getUserLatestRate(@DAccount('user') user: User) {
    const latestMatch = await this.usersService.getUserLatestMatch(user.id);
    return await this.usersService.getHasUserRated(user.id, latestMatch);
  }

  @Private('user')
  @Get('/:matchId/rates')
  async getUserMatchRates(
    @DAccount('user') user: User,
    @Param('matchId') matchId: string,
  ) {
    return await this.usersService.getUserMatchRates(user.id, matchId);
  }
}
