import { IsEmail, IsString, MinLength } from 'class-validator';
import {
  INVALID_EMAIL_FORMAT,
  INVALID_PASSWORD_FORMAT,
} from './users-error.messages';

export const StartTier = '비기너';

export class SignUpUserDto {
  @IsEmail({}, { message: INVALID_EMAIL_FORMAT })
  email: string;

  @MinLength(8, { message: INVALID_PASSWORD_FORMAT })
  @IsString()
  password: string;
}

export class SignInUserDto {
  @IsEmail({}, { message: INVALID_EMAIL_FORMAT })
  email: string;

  @MinLength(8, { message: INVALID_PASSWORD_FORMAT })
  @IsString()
  password: string;
}
