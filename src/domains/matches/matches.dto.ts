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
import { ErrorCodes } from 'src/common/exceptions/error-codes';

export class CreateMatchDto {
  @IsString()
  @MinLength(5, { message: ErrorCodes.INVALID_TITLE.message })
  title: string;

  @IsString()
  @MinLength(10, { message: ErrorCodes.INVALID_CONTENT.message })
  content: string;

  @IsEnum(Gender, { message: ErrorCodes.CHOOSE_GENDER.message })
  gender: Gender;

  @IsNumber()
  @Min(2, { message: ErrorCodes.INVALID_CAPABILITY.message })
  capability: number;

  @IsString()
  @IsNotEmpty({ message: ErrorCodes.CHOOSE_SPORTS_TYPE.message })
  sportsTypeName: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  @MinLength(1, { message: ErrorCodes.INVALID_PLACENAME.message })
  placeName: string;

  @IsString()
  @MinLength(2, { message: ErrorCodes.INVALID_REGION.message })
  region: string;

  @IsString()
  @MinLength(5, { message: ErrorCodes.INVALID_REGION.message })
  address: string;

  @IsDateString()
  matchDay: Date;
}

export class UpdateMatchDto {
  @IsString()
  @IsOptional()
  @MinLength(5, { message: ErrorCodes.INVALID_TITLE.message })
  title: string;

  @IsString()
  @IsOptional()
  @MinLength(10, { message: ErrorCodes.INVALID_CONTENT.message })
  content: string;

  @IsOptional()
  @IsEnum(Gender, { message: ErrorCodes.CHOOSE_GENDER.message })
  gender: Gender;

  @IsNumber()
  @IsOptional()
  @Min(2, { message: ErrorCodes.INVALID_CAPABILITY.message })
  capability: number;

  @IsOptional()
  @IsNotEmpty({ message: ErrorCodes.CHOOSE_SPORTS_TYPE.message })
  sportsTypeName: string;

  @IsNumber()
  @IsOptional()
  latitude: number;

  @IsNumber()
  @IsOptional()
  longitude: number;

  @IsString()
  @IsOptional()
  @MinLength(1, { message: ErrorCodes.INVALID_PLACENAME.message })
  placeName: string;

  @IsString()
  @IsOptional()
  @MinLength(2, { message: ErrorCodes.INVALID_REGION.message })
  region: string;

  @IsString()
  @IsOptional()
  @MinLength(5, { message: ErrorCodes.INVALID_REGION.message })
  address: string;

  @IsOptional()
  @IsDateString()
  matchDay: Date;
}

export class ParticipantRating {
  @IsString()
  @IsNotEmpty()
  participantId: string;

  @IsInt()
  @Max(5, { message: ErrorCodes.INVALID_RATE.message })
  @Min(1, { message: ErrorCodes.INVALID_RATE.message })
  value: number;
}

export class RateDto {
  @Type(() => ParticipantRating)
  @ValidateNested({ each: true })
  @ArrayNotEmpty({ message: ErrorCodes.MINIMUM_RATERS_REQUIRED.message })
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
