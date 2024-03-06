import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Post,
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtManagerService } from 'src/jwt-manager/jwt-manager.service';
import dayUtil from 'src/utils/day';
import {
  DUPLICATE_EMAIL,
  DUPLICATE_NICKNAME,
  INVALID_CHANGE_NICKNAME,
  INVALID_USER_CREDENTIAL,
  NOT_ALLOWED_USER,
  NOT_FOUND_PROFILE,
} from './users-error.messages';
import {
  CreateProfileDto,
  EditProfileDto,
  SignInUserDto,
  SignUpUserDto,
} from './users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtManagerService: JwtManagerService,
  ) {}

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpUserDto) {
    const duplicateEmail = await this.usersService.findUserByEmail(
      signUpDto.email,
    );

    if (duplicateEmail) throw new ConflictException(DUPLICATE_EMAIL);

    const user = await this.usersService.createUser(signUpDto);

    const accessToken = this.jwtManagerService.sign('user', {
      id: user.id,
      email: user.email,
    });

    return { accessToken };
  }

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInUserDto) {
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

    return { accessToken };
  }

  /**
   * TODO: DUser 나 Private 유저 온리 걸기.
   * TODO: user 확인하기.
   */
  @Post(':userId/profile')
  async createProfile(
    @Param('userId') userId: string,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    const duplicateNickname = await this.usersService.findProfileByNickname(
      createProfileDto.nickName,
    );

    if (duplicateNickname) throw new ConflictException(DUPLICATE_NICKNAME);

    const profile = await this.usersService.createProfile(
      userId,
      createProfileDto,
    );

    return profile;
  }

  /**
   * TODO: DUser 나 Private 유저 온리 걸기.
   * TODO: user 확인하기.
   */
  @Put(':userId/profile')
  async editProfile(
    @Param('userId') userId: string,
    @Body() editProfileDto: EditProfileDto,
  ) {
    const profile = await this.usersService.findProfileByUserId(userId);

    if (!profile) throw new NotFoundException(NOT_FOUND_PROFILE);
    else if (profile.userId !== userId)
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
      userId,
      editProfileDto,
    );

    return editedProfile;
  }
}
