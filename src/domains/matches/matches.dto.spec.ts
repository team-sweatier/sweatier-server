import 'reflect-metadata';
import { validate } from 'class-validator';
import { CreateMatchDto, ParticipantRating } from './matches.dto';
import { plainToInstance } from 'class-transformer';
import { Gender } from '@prisma/client';

describe('CreateMatchDto', () => {
  let matchDto: CreateMatchDto;
  beforeEach(() => {
    matchDto = plainToInstance(CreateMatchDto, {
      title: '경기 모집글 제목입니다.',
      content: '경기 모집글 내용입니다.',
      gender: 'both',
      capability: 6,
      sportsTypeName: 'tennis',
      latitude: 10.1,
      longitude: 10.1,
      placeName: '경기 장소명입니다.',
      region: '경기 지역명입니다.',
      address: '경기 장소 주소명입니다.',
      matchDay: new Date().toISOString(),
    });
  });

  test('경기 모집글 작성시 DTO 검증이 성공적으로 수행되어야 함', async () => {
    const validationErrors = await validate(matchDto);
    expect(validationErrors).toHaveLength(0);
  });

  test('경기 모집글 작성이 실패해야 함 - 성별 유효성 검사 실패', async () => {
    matchDto.gender = 'rainbow' as Gender;
    const validationErrors = await validate(matchDto);
    expect(validationErrors[0].constraints).toHaveProperty('isEnum');
  });

  test('경기 모집글 작성이 실패해야 함 - 모집인원 유효성 검사 실패', async () => {
    matchDto.capability = 0;
    const validationErrors = await validate(matchDto);
    expect(validationErrors[0].constraints).toHaveProperty('min');
  });

  test('경기 모집글 작성이 실패해야 함 - 날짜 유효성 검사 실패', async () => {
    matchDto = plainToInstance(CreateMatchDto, {
      ...matchDto,
      matchDay: '12321321321',
    });

    const validationErrors = await validate(matchDto);
    expect(validationErrors).not.toHaveLength(0);
    expect(validationErrors[0].constraints).toHaveProperty('isDateString');
  });
});

describe('ParticipantRating', () => {
  let ratingDto: ParticipantRating;
  beforeEach(() => {
    ratingDto = plainToInstance(ParticipantRating, {
      participantId: '참가자 아이디입니다.',
      value: 5,
    });
  });

  test('참가자 평가시 DTO 검증이 성공적으로 수행되어야 함', async () => {
    const validationErrors = await validate(ratingDto);
    expect(validationErrors).toHaveLength(0);
  });

  test('참가자 평가가 실패해야 함 - 범위 밖의 점수', async () => {
    ratingDto.value = 0;
    const validationErrors = await validate(ratingDto);
    expect(validationErrors[0].constraints).toHaveProperty('min');
  });
});
