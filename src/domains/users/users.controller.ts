import {
  Body,
  ConflictException,
  Controller,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtManagerService } from 'src/jwt-manager/jwt-manager.service';
import {
  DUPLICATE_EMAIL,
  INVALID_USER_CREDENTIAL,
} from './users-error.messages';
import { SignInUserDto, SignUpUserDto } from './users.dto';
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
}
