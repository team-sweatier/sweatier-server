import { validate } from 'class-validator';
import { ErrorCodes } from 'src/common/exceptions/error-codes';
import { SignUpUserDto } from './users.dto';

test('회원가입 DTO 검증이 성공적으로 수행되어야 함', async () => {
  const signUpUserDto = new SignUpUserDto();
  signUpUserDto.email = 'blalbadfas@naver.com';
  signUpUserDto.password = '!Rh123123312321';

  const validationErrors = await validate(signUpUserDto);

  expect(validationErrors).toHaveLength(0);
});

test('회원가입 DTO 검증이 INVALID_PASSWORD_FORMAT 에러 메시지를 가진 에러를 반환해야 함', async () => {
  const signUpUserDto = new SignUpUserDto();
  signUpUserDto.email = 'blalbadfas@naver.com';
  signUpUserDto.password = '!h123123312321';

  const result = await validate(signUpUserDto);

  expect(result).toHaveLength(1);
  expect(result[0].constraints.matches).toBe(
    ErrorCodes.INVALID_PASSWORD_FORMAT.message,
  );
});
