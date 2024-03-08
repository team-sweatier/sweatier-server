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
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { CookieOptions, Request, Response } from 'express';
import { DAccount } from 'src/decorators/account.decorator';
import { Private } from 'src/decorators/private.decorator';
import { JwtManagerService } from 'src/jwt-manager/jwt-manager.service';
import dayUtil from 'src/utils/day';
import { KakaoAuthService } from './kakao-auth/kakao-auth.service';
import {
  DUPLICATE_NICKNAME,
  DUPLICATE_USER,
  INVALID_CHANGE_NICKNAME,
  INVALID_USER_CREDENTIAL,
  NOT_ALLOWED_USER,
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
  ) {
    this.cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: this.configService.get('CLIENT_DOMAIN'),
      maxAge: parseInt(this.configService.get('COOKIE_MAX_AGE')),
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
  async signInKakao(@Res({ passthrough: true }) res: Response) {
    return res.redirect(this.kakaoAuthService.getKakaoAuthUrl());
  }

  @Get('sign-in/kakao/callback')
  async signInKakaoCallback(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const id = await this.kakaoAuthService.getKakaoUsersId(
      request.query.code as string,
    );

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
  @Post('profile')
  async createProfile(
    @Body() createProfileDto: CreateProfileDto,
    @DAccount('user') user: User,
  ) {
    const duplicateNickname = await this.usersService.findProfileByNickname(
      createProfileDto.nickName,
    );

    if (duplicateNickname) throw new ConflictException(DUPLICATE_NICKNAME);

    const profile = await this.usersService.createProfile(
      user.id,
      createProfileDto,
    );

    return profile;
  }

  @Private('user')
  @Put('profile')
  async editProfile(
    @Body() editProfileDto: EditProfileDto,
    @DAccount('user') user: User,
  ) {
    const profile = await this.usersService.findProfileByUserId(user.id);

    if (!profile) throw new NotFoundException(NOT_FOUND_PROFILE);
    else if (profile.userId !== user.id)
      throw new ForbiddenException(NOT_ALLOWED_USER);

    if (profile.nickNameUpdatedAt && editProfileDto.nickName) {
      const daysSinceLastUpdate = dayUtil
        .day()
        .diff(dayUtil.day(profile.nickNameUpdatedAt), 'day');
      if (daysSinceLastUpdate < 30)
        throw new ForbiddenException(INVALID_CHANGE_NICKNAME);
    }

    if (editProfileDto.nickName) {
      const duplicateNickname = await this.usersService.findProfileByNickname(
        editProfileDto.nickName,
      );
      if (duplicateNickname) {
        throw new ConflictException(DUPLICATE_NICKNAME);
      }
    }

    const editedProfile = await this.usersService.editProfile(
      user.id,
      editProfileDto,
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
  @Get(':userId/applied-matches')
  async getAppliedMatches(@DAccount('user') user: User) {
    return await this.usersService.getAppliedMatches(user.id, false);
  }

  @Private('user')
  @Get(':userId/participated-matches')
  async getParticipatedMatches(
    @DAccount('user') user: User,
    @Param('userId') userId: string,
  ) {
    if (userId !== user.id) {
      throw new UnauthorizedException(NOT_ALLOWED_USER);
    }
    return await this.usersService.getAppliedMatches(user.id, true);
  }
}
