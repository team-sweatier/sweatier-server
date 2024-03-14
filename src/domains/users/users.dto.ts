import { Gender } from '@prisma/client';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import {
  BANK_INFO_NEEDED,
  GENDER_TYPE_NEEDED,
  INVALID_EMAIL_FORMAT,
  INVALID_NICKNAME,
  INVALID_PASSWORD_FORMAT,
  INVALID_PASSWORD_LENGTH,
  INVALID_USER_CREDENTIAL,
  PHONE_NUMBER_NEEDED,
} from './users-error.messages';

// 대문자,소문자, 특수문자 각 1개이상씩 있는지 검사
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]+$/;

export class SignUpKakaoUserDto {
  constructor(id: string) {
    this.id = id;
    this.email = 'kakao-account';
  }

  @IsString()
  id: string;

  email: string;
}

export class SignUpUserDto {
  @IsEmail({}, { message: INVALID_EMAIL_FORMAT })
  email: string;

  @MinLength(8, { message: INVALID_PASSWORD_LENGTH })
  @Matches(passwordRegex, { message: INVALID_PASSWORD_FORMAT })
  @IsString()
  password: string;
}

export class SignInUserDto {
  @IsEmail({}, { message: INVALID_USER_CREDENTIAL })
  email: string;

  @Matches(passwordRegex, { message: INVALID_USER_CREDENTIAL })
  @IsString()
  password: string;
}

export class CreateProfileDto {
  @IsEnum(Gender, { message: GENDER_TYPE_NEEDED })
  gender: Gender;

  @IsString({ message: PHONE_NUMBER_NEEDED })
  @MinLength(11, { message: PHONE_NUMBER_NEEDED })
  phoneNumber: string;

  @IsString({ message: BANK_INFO_NEEDED })
  @MinLength(2, { message: BANK_INFO_NEEDED })
  bankName: string;

  @IsString({ message: BANK_INFO_NEEDED })
  @MinLength(8, { message: BANK_INFO_NEEDED })
  accountNumber: string;

  @IsString({ message: INVALID_NICKNAME })
  @MinLength(2, { message: INVALID_NICKNAME })
  nickName: string;

  @IsString()
  oneLiner?: string;
}

export class EditProfileDto {
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(Gender, { message: GENDER_TYPE_NEEDED })
  gender: Gender;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(11, { message: PHONE_NUMBER_NEEDED })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: BANK_INFO_NEEDED })
  bankName: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: BANK_INFO_NEEDED })
  accountNumber: string;

  @IsOptional()
  @IsNotEmpty({ message: INVALID_NICKNAME })
  nickName: string | undefined;

  @IsOptional()
  @IsString()
  oneLiner: string;
}

export class EditFavoriteDto {
  @IsNotEmpty()
  @IsArray()
  sportsType: string[];
}
