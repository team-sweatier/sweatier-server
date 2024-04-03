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
import { ErrorCodes } from 'src/common/temp';

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
  @IsEmail({}, { message: ErrorCodes.INVALID_EMAIL_FORMAT.message })
  email: string;

  @MinLength(8, { message: ErrorCodes.INVALID_PASSWORD_LENGTH.message })
  @Matches(passwordRegex, {
    message: ErrorCodes.INVALID_PASSWORD_FORMAT.message,
  })
  @IsString()
  password: string;
}

export class SignInUserDto {
  @IsEmail(
    {},
    {
      message: ErrorCodes.USER_INVALID_CREDENTIAL.message,
    },
  )
  email: string;

  @Matches(passwordRegex, {
    message: ErrorCodes.USER_INVALID_CREDENTIAL.message,
  })
  @IsString()
  password: string;
}

export class CreateProfileDto {
  @IsEnum(Gender, { message: ErrorCodes.GENDER_TYPE_NEEDED.message })
  gender: Gender;

  @IsString({ message: ErrorCodes.PHONE_NUMBER_NEEDED.message })
  @MinLength(11, { message: ErrorCodes.PHONE_NUMBER_NEEDED.message })
  phoneNumber: string;

  @IsString({ message: ErrorCodes.BANK_INFO_NEEDED.message })
  @MinLength(2, { message: ErrorCodes.BANK_INFO_NEEDED.message })
  bankName: string;

  @IsString({ message: ErrorCodes.BANK_INFO_NEEDED.message })
  @MinLength(8, { message: ErrorCodes.BANK_INFO_NEEDED.message })
  accountNumber: string;

  @IsString({ message: ErrorCodes.INVALID_NICKNAME.message })
  @MinLength(2, { message: ErrorCodes.INVALID_NICKNAME.message })
  nickName: string;

  @IsString()
  oneLiner?: string;
}

export class EditProfileDto {
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(Gender, { message: ErrorCodes.GENDER_TYPE_NEEDED.message })
  gender: Gender;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(11, { message: ErrorCodes.PHONE_NUMBER_NEEDED.message })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: ErrorCodes.BANK_INFO_NEEDED.message })
  bankName: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: ErrorCodes.BANK_INFO_NEEDED.message })
  accountNumber: string;

  @IsOptional()
  @IsNotEmpty({ message: ErrorCodes.INVALID_NICKNAME.message })
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
