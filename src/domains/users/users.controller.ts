import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { CookieOptions, Response } from 'express';
import { DAccount } from 'src/decorators/account.decorator';
import { Private } from 'src/decorators/private.decorator';
import { JwtManagerService } from 'src/jwt-manager/jwt-manager.service';
import { dayUtil } from 'src/utils/day';
import { NO_MATCHES_FOUND } from '../matches/matches-error.messages';
import { MatchesService } from '../matches/matches.service';
import { KakaoAuthService } from './kakao-auth/kakao-auth.service';
import {
  DUPLICATE_NICKNAME,
  DUPLICATE_PHONENUMBER,
  DUPLICATE_USER,
  FOUND_PROFILE,
  INVALID_CHANGE_NICKNAME,
  INVALID_USER_CREDENTIAL,
  NOT_FOUND_PROFILE,
} from './users-error.messages';
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
    const duplicateEmail = await this.usersService.findUserByEmail(
      signUpDto.email,
    );

    if (duplicateEmail) throw new ConflictException(DUPLICATE_USER);

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
    const foundUser = await this.usersService.findUserByEmail(signInDto.email);

    if (!foundUser) {
      throw new NotFoundException(INVALID_USER_CREDENTIAL);
    }
    const validate = await this.usersService.validateUsersCredential(
      foundUser,
      signInDto,
    );

    if (!validate) throw new UnauthorizedException(INVALID_USER_CREDENTIAL);

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
    try {
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
    } catch (error) {
      throw new UnauthorizedException('인증에 실패했습니다.');
    }
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
    const foundProfile = await this.usersService.findProfileByUserId(user.id);

    if (foundProfile) throw new NotFoundException(FOUND_PROFILE);

    const duplicatePhoneNumber =
      await this.usersService.findProfileByPhoneNumber(
        createProfileDto.phoneNumber,
      );

    if (duplicatePhoneNumber)
      throw new ConflictException(DUPLICATE_PHONENUMBER);

    const duplicateNickname = await this.usersService.findProfileByNickname(
      createProfileDto.nickName,
    );

    if (duplicateNickname) throw new ConflictException(DUPLICATE_NICKNAME);

    const profile = await this.usersService.createProfile(
      user.id,
      createProfileDto,
      file,
    );

    return profile;
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
    const profile = await this.usersService.findProfileByUserId(user.id);

    if (!profile) throw new NotFoundException(NOT_FOUND_PROFILE);

    if (profile.nickNameUpdatedAt && editProfileDto.nickName) {
      const daysSinceLastUpdate = dayUtil
        .day()
        .diff(dayUtil.day(profile.nickNameUpdatedAt), 'day');
      if (
        daysSinceLastUpdate < 30 &&
        profile.nickName !== editProfileDto.nickName
      )
        throw new ForbiddenException(INVALID_CHANGE_NICKNAME);
    }

    if (editProfileDto.phoneNumber) {
      const duplicatePhoneNumber =
        await this.usersService.findProfileByPhoneNumber(
          editProfileDto.phoneNumber,
        );
      if (duplicatePhoneNumber) {
        throw new ConflictException(DUPLICATE_PHONENUMBER);
      }
    }

    if (editProfileDto.nickName) {
      const duplicateNickname = await this.usersService.findProfileByNickname(
        editProfileDto.nickName,
      );
      if (duplicateNickname && profile.nickName !== editProfileDto.nickName) {
        throw new ConflictException(DUPLICATE_NICKNAME);
      }
    }

    const editedProfile = await this.usersService.editProfile(
      user.id,
      editProfileDto,
      file,
    );

    return editedProfile;
  }

  @Private('user')
  @Get('tier')
  async getUserTier(@DAccount('user') user: User) {
    return await this.usersService.getUserTier(user.id);
  }

  @Private('user')
  @Put('favorite')
  async editUserFavorite(
    @Body()
    editFavoriteDto: EditFavoriteDto,
    @DAccount('user') user: User,
  ) {
    return await this.usersService.editUserFavorite(user.id, editFavoriteDto);
  }

  @Private('user')
  @Get('matches')
  async getMatches(@DAccount('user') user: User) {
    return await this.matchesService.findMatches({}, user.id);
  }

  @Private('user')
  @Get('latest-rating')
  async getUserLatestRate(@DAccount('user') user: User) {
    const latestMatch = await this.usersService.getUserLatestMatch(user.id);
    if (!latestMatch) {
      throw new NotFoundException(NO_MATCHES_FOUND);
    }
    return await this.usersService.getHasUserRated(user.id, latestMatch);
  }

  // @Private('user')
  // @Get('/applied-matches')
  // async getAppliedMatches(@DAccount('user') user: User) {
  //   return await this.usersService.getUserLatestRate(user.id, false);
  // }

  // @Private('user')
  // @Get('/participated-matches')
  // async getParticipatedMatches(@DAccount('user') user: User) {
  //   return await this.usersService.getUserLatestRate(user.id, true);
  // }

  @Private('user')
  @Get('/:matchId/rates')
  async getUserMatchRates(
    @DAccount('user') user: User,
    @Param('matchId') matchId: string,
  ) {
    return await this.usersService.getUserMatchRates(user.id, matchId);
  }
}
