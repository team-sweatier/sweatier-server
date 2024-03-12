import { Gender } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  CHOOSE_GENDER,
  CHOOSE_SPORTSTYPE,
  CHOOSE_TIER,
  INVALID_CAPABILITY,
  INVALID_CONTENT,
  INVALID_PLACENAME,
  INVALID_RATE,
  INVALID_REGION,
  INVALID_TITLE,
  MINIMUM_RATERS_REQUIRED,
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
  @MinLength(1, { message: INVALID_PLACENAME })
  placeName: string;

  @IsString()
  @MinLength(2, { message: INVALID_REGION })
  region: string;

  @IsString()
  @MinLength(5, { message: INVALID_REGION })
  address: string;

  @IsDateString()
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
  @MinLength(1, { message: INVALID_PLACENAME })
  placeName?: string;

  @IsString()
  @IsOptional()
  @MinLength(2, { message: INVALID_REGION })
  region?: string;

  @IsString()
  @IsOptional()
  @MinLength(5, { message: INVALID_REGION })
  address: string;

  @IsOptional()
  @IsDateString()
  matchDay?: Date;
}

export class ParticipantRating {
  @IsString()
  @IsNotEmpty()
  participantId: string;

  @IsInt()
  @Max(5, { message: INVALID_RATE })
  @Min(1, { message: INVALID_RATE })
  value: number;
}

export class RateDto {
  @Type(() => ParticipantRating)
  @ValidateNested({ each: true })
  @ArrayNotEmpty({ message: MINIMUM_RATERS_REQUIRED })
  ratings: ParticipantRating[];
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

  @IsOptional()
  @IsString()
  tier?: string;
}
