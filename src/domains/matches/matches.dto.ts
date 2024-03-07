import { Gender } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateMatchDto {
  @IsString()
  @MinLength(5, { message: '제목은 다섯글자 이상 입력해주세요' })
  title: string;

  @IsString()
  @MinLength(10, { message: '내용은 열글자 이상 입력해주세요' })
  content: string;

  @IsEnum(Gender, { message: '성별을 선택해주세요.' })
  gender: Gender;

  @IsNumber()
  @Min(2, { message: '모집 인원을 두 명 이상 입력해주세요.' })
  capability: number;

  @IsNotEmpty({ message: '종목을 설정해주세요' })
  sportsTypeId: number;

  @IsNotEmpty({ message: '티어를 설정해주세요' })
  tierId: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  @MinLength(1, { message: '주소를 입력해주세요.' })
  address: string;

  @IsDateString()
  matchDay: string;
}

export class UpdateMatchDto {
  @IsString()
  @IsOptional()
  @MinLength(5, { message: '제목은 다섯글자 이상 입력해주세요' })
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(10, { message: '내용은 열글자 이상 입력해주세요' })
  content?: string;

  @IsOptional()
  @IsEnum(Gender, { message: '성별을 선택해주세요.' })
  gender?: Gender;

  @IsNumber()
  @IsOptional()
  @Min(2, { message: '모집 인원을 두 명 이상 입력해주세요.' })
  capability?: number;

  @IsOptional()
  @IsNotEmpty({ message: '종목을 설정해주세요' })
  sportsTypeId?: number;

  @IsOptional()
  @IsNotEmpty({ message: '티어를 설정해주세요' })
  tierId?: string;

  @IsString()
  @IsOptional()
  @MinLength(5, { message: '주소를 입력해주세요.' })
  address?: string;

  @IsOptional()
  @IsDateString()
  matchDay?: Date;
}
