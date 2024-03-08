import { Gender } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import {
  CHOOSE_GENDER,
  CHOOSE_SPORTSTYPE,
  CHOOSE_TIER,
  INVALID_ADDRESS,
  INVALID_CAPABILITY,
  INVALID_CONTENT,
  INVALID_RATE,
  INVALID_TITLE,
} from './matches-error.messages';

export class CreateMatchDto {
  @IsString()
  @MinLength(5, { message: INVALID_TITLE })
  title: string;

  @IsString()
  @MinLength(10, { message: INVALID_CONTENT })
  content: string;

  @IsEnum(Gender, { message: CHOOSE_GENDER })
  gender: Gender;

  @IsNumber()
  @Min(2, { message: INVALID_CAPABILITY })
  capability: number;

  @IsNotEmpty({ message: CHOOSE_SPORTSTYPE })
  sportsTypeId: number;

  @IsNotEmpty({ message: CHOOSE_TIER })
  tierId: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  @MinLength(5, { message: INVALID_ADDRESS })
  address: string;
  @MinLength(1, { message: '구장명을 입력해주세요.' })
  placeName: string;

  @IsString()
  @MinLength(2, { message: '리전을 두글자 이상 입력해주세요.' })
  region: string;

  @IsDateString()
  matchDay: Date;
  matchDay: Date;
}

export class UpdateMatchDto {
  @IsString()
  @IsOptional()
  @MinLength(5, { message: INVALID_TITLE })
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(10, { message: INVALID_CONTENT })
  content?: string;

  @IsOptional()
  @IsEnum(Gender, { message: CHOOSE_GENDER })
  gender?: Gender;

  @IsNumber()
  @IsOptional()
  @Min(2, { message: INVALID_CAPABILITY })
  capability?: number;

  @IsOptional()
  @IsNotEmpty({ message: CHOOSE_SPORTSTYPE })
  sportsTypeId?: number;

  @IsOptional()
  @IsNotEmpty({ message: CHOOSE_TIER })
  tierId?: string;

  @IsString()
  @IsOptional()
  @MinLength(5, { message: INVALID_ADDRESS })
  address?: string;

  @IsOptional()
  @IsDateString()
  matchDay?: Date;
}

export class RateDto {
  @IsString()
  userId: string;

  @Max(5, { message: INVALID_RATE })
  @Min(1, { message: INVALID_RATE })
  value: number;
}
export class FindMatchesDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  sportType?: string;
}
