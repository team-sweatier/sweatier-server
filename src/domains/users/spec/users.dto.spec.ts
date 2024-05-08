import { Gender } from '@prisma/client';
import { validate } from 'class-validator';
import { ErrorCodes } from 'src/common/exceptions/error-codes';
import {
  CreateProfileDto,
  EditProfileDto,
  SignInUserDto,
  SignUpKakaoUserDto,
  SignUpUserDto,
} from '../users.dto';

describe('SignUpUserDto', () => {
  const signUpUserDto = new SignUpUserDto();

  beforeEach(() => {
    signUpUserDto.email = 'blalbadfas@naver.com';
    signUpUserDto.password = '!Rh123123312321';
  });

  test('회원가입 DTO 검증이 성공적으로 수행되어야 함', async () => {
    const validationErrors = await validate(signUpUserDto);
    expect(validationErrors).toHaveLength(0);
  });

  test('회원가입 DTO 검증이 실패해야 함 - 잘못된 이메일 형식', async () => {
    signUpUserDto.email = 'blalbadfasnaver.com';
    const validationErrors = await validate(signUpUserDto);

    expect(validationErrors).not.toHaveLength(0);
    expect(validationErrors[0].constraints).toMatchObject({
      isEmail: ErrorCodes.INVALID_EMAIL_FORMAT.message,
    });
  });

  test('회원가입 DTO 검증이 실패해야 함 - 잘못된 패스워드 형식', async () => {
    // 패스워드는 대문자,소문자, 특수문자 각 1개 이상씩 있어야 함
    signUpUserDto.password = '12312';
    const validationErrors = await validate(signUpUserDto);

    expect(validationErrors).not.toHaveLength(0);
    expect(validationErrors[0].constraints).toMatchObject({
      matches: ErrorCodes.INVALID_PASSWORD_FORMAT.message,
      minLength: ErrorCodes.INVALID_PASSWORD_LENGTH.message,
    });
  });
});

describe('SignUpKakaoUserDto', () => {
  test('카카오 회원가입 DTO 검증이 성공적으로 수행되어야 함', async () => {
    const signUpKakaoUserDto = new SignUpKakaoUserDto('1235345');
    const result = await validate(signUpKakaoUserDto);
    expect(result).toHaveLength(0);
  });
});

describe('SignInUserDto', () => {
  const signInUserDto = new SignInUserDto();

  beforeEach(() => {
    signInUserDto.email = 'balabalba@gamil.com';
    signInUserDto.password = '!Ru32345r3412';
  });

  test('로그인 DTO 검증이 성공적으로 수행되어야 함', async () => {
    const validationErrors = await validate(signInUserDto);
    expect(validationErrors).toHaveLength(0);
  });

  test('로그인 DTO 검증이 성공적으로 수행되어야 함', async () => {
    const validationErrors = await validate(signInUserDto);

    expect(validationErrors).toHaveLength(0);
  });

  test('로그인 DTO 검증이 실패해야 함 - 잘못된 이메일 형식', async () => {
    signInUserDto.email = 'blalbadfasnaver.com';
    const validationErrors = await validate(signInUserDto);

    expect(validationErrors).not.toHaveLength(0);
    expect(validationErrors[0].constraints).toMatchObject({
      isEmail: ErrorCodes.USER_INVALID_CREDENTIAL.message,
    });
  });

  test('로그인 DTO 검증이 실패해야 함 - 잘못된 패스워드 형식', async () => {
    // 패스워드는 대문자,소문자, 특수문자 각 1개 이상씩 있어야 함
    signInUserDto.password = '12312';
    const validationErrors = await validate(signInUserDto);

    expect(validationErrors).not.toHaveLength(0);
    expect(validationErrors[0].constraints).toMatchObject({
      matches: ErrorCodes.USER_INVALID_CREDENTIAL.message,
    });
  });
});

describe('CreateProfileDto', () => {
  const createProfileDto = new CreateProfileDto();

  beforeEach(() => {
    createProfileDto.gender = Gender.male;
    createProfileDto.phoneNumber = '01012345678';
    createProfileDto.bankName = 'KB';
    createProfileDto.accountNumber = '132121423';
    createProfileDto.nickName = 'nickname';
    createProfileDto.oneLiner = 'Hello World';
  });

  test('프로필 생성 DTO 검증이 성공적으로 수행되어야 함', async () => {
    const validationErrors = await validate(createProfileDto);
    expect(validationErrors).toHaveLength(0);
  });

  test('프로필 생성 DTO 검증이 실패해야 함 - 잘못된 성별', async () => {
    createProfileDto.gender = 'rainbow' as Gender;

    const validationErrors = await validate(createProfileDto);
    expect(validationErrors).not.toHaveLength(0);
    expect(validationErrors[0].constraints).toMatchObject({
      isEnum: ErrorCodes.GENDER_TYPE_NEEDED.message,
    });
  });

  test('프로필 생성 DTO 검증이 실패해야 함 - 잘못된 전화번호', async () => {
    // 잘못된 전화번호 설정
    createProfileDto.phoneNumber = '12345';

    const validationErrors = await validate(createProfileDto);
    expect(validationErrors).not.toHaveLength(0);
    expect(validationErrors[0].constraints).toMatchObject({
      minLength: ErrorCodes.PHONE_NUMBER_NEEDED.message,
    });
  });

  test('프로필 생성 DTO 검증이 실패해야 함 - 빈 은행 이름', async () => {
    // 빈 은행 이름 설정
    createProfileDto.bankName = '';

    const validationErrors = await validate(createProfileDto);
    expect(validationErrors).not.toHaveLength(0);
    expect(validationErrors[0].constraints).toMatchObject({
      minLength: ErrorCodes.BANK_INFO_NEEDED.message,
    });
  });

  test('프로필 생성 DTO 검증이 실패해야 함 - 빈 계좌 번호', async () => {
    // 빈 계좌 번호 설정
    createProfileDto.accountNumber = '';

    const validationErrors = await validate(createProfileDto);
    expect(validationErrors).not.toHaveLength(0);
    expect(validationErrors[0].constraints).toMatchObject({
      minLength: ErrorCodes.BANK_INFO_NEEDED.message,
    });
  });

  test('프로필 생성 DTO 검증이 실패해야 함 - 빈 닉네임', async () => {
    // 빈 닉네임 설정
    createProfileDto.nickName = '';

    const validationErrors = await validate(createProfileDto);
    expect(validationErrors).not.toHaveLength(0);
    expect(validationErrors[0].constraints).toMatchObject({
      minLength: ErrorCodes.INVALID_NICKNAME.message,
    });
  });
});

describe('EditProfileDto', () => {
  let editProfileDto: EditProfileDto;

  beforeEach(() => {
    editProfileDto = new EditProfileDto();
  });

  test('프로필 갱신 DTO 검증이 성공적으로 수행되어야 함', async () => {
    const validationErrors = await validate(editProfileDto);
    expect(validationErrors).toHaveLength(0);
  });

  test('프로필 갱신 DTO 검증이 실패해야 함 - 잘못된 성별', async () => {
    editProfileDto.gender = 'rainbow' as Gender;

    const validationErrors = await validate(editProfileDto);
    expect(validationErrors).not.toHaveLength(0);
    expect(validationErrors[0].constraints).toMatchObject({
      isEnum: ErrorCodes.GENDER_TYPE_NEEDED.message,
    });
  });

  test('프로필 갱신 DTO 검증이 실패해야 함 - 잘못된 전화번호', async () => {
    // 잘못된 전화번호 설정
    editProfileDto.phoneNumber = '12345';

    const validationErrors = await validate(editProfileDto);
    expect(validationErrors).not.toHaveLength(0);
    expect(validationErrors[0].constraints).toMatchObject({
      minLength: ErrorCodes.PHONE_NUMBER_NEEDED.message,
    });
  });

  test('프로필 갱신 DTO 검증이 실패해야 함 - 잘못된 은행 이름', async () => {
    // 빈 은행 이름 설정
    editProfileDto.bankName = 'o';

    const validationErrors = await validate(editProfileDto);
    expect(validationErrors).not.toHaveLength(0);
    expect(validationErrors[0].constraints).toMatchObject({
      minLength: ErrorCodes.BANK_INFO_NEEDED.message,
    });
  });

  test('프로필 갱신 DTO 검증이 실패해야 함 - 잘못된 계좌 번호', async () => {
    // 빈 계좌 번호 설정
    editProfileDto.accountNumber = '312';

    const validationErrors = await validate(editProfileDto);
    expect(validationErrors).not.toHaveLength(0);
    expect(validationErrors[0].constraints).toMatchObject({
      minLength: ErrorCodes.BANK_INFO_NEEDED.message,
    });
  });
});
