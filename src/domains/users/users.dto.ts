import { Gender } from '@prisma/client';
import { IsEmail, IsEnum, IsString, Matches, MinLength } from 'class-validator';
import {
  INVALID_EMAIL_FORMAT,
  INVALID_PASSWORD_FORMAT,
  INVALID_PASSWORD_LENGTH,
} from './users-error.messages';

// 대문자,소문자, 특수문자 각 1개이상씩 있는지 검사
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]+$/;

export class SignUpUserDto {
  @IsEmail({}, { message: INVALID_EMAIL_FORMAT })
  email: string;

  @MinLength(8, { message: INVALID_PASSWORD_LENGTH })
  @Matches(passwordRegex, { message: INVALID_PASSWORD_FORMAT })
  @IsString()
  password: string;
}

export class SignInUserDto {
  @IsEmail({}, { message: INVALID_EMAIL_FORMAT })
  email: string;

  @MinLength(8, { message: INVALID_PASSWORD_LENGTH })
  @Matches(passwordRegex, { message: INVALID_PASSWORD_FORMAT })
  @IsString()
  password: string;
}

export class CreateProfileDto {
  //img: FormData;
  img: string; //임시
  @IsEnum(Gender)
  gender: Gender;
  @IsString()
  phoneNumber: string;
  @IsString()
  bankName: string;
  @IsString()
  accountNumber: string;
  @IsString()
  nickName: string;
  @IsString()
  oneLiner?: string;
}

export class EditProfileDto {
  //img: FormData;
  img: string; //임시
  @IsEnum(Gender)
  gender: Gender;
  @IsString()
  phoneNumber: string;
  @IsString()
  bankName: string;
  @IsString()
  accountNumber: string;

  nickName: string | undefined;
  @IsString()
  oneLiner?: string;
}

export class EditFavoriteDto {
  // @IsString()
  sportType: string[];
}
