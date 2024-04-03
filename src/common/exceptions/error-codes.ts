export class ErrorCodes {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
  ) {
    this.statusCode = statusCode;
    this.message = message;
  }

  // 경기 관련 에러 코드
  static CHOOSE_GENDER = new ErrorCodes(400, '성별을 선택해주세요.');

  static CHOOSE_SPORTS_TYPE = new ErrorCodes(400, '종목을 설정해주세요.');

  static INVALID_CAPABILITY = new ErrorCodes(
    400,
    '모집 인원을 두 명 이상 입력해주세요.',
  );

  static INVALID_CONTENT = new ErrorCodes(
    400,
    '내용은 열글자 이상 입력해주세요.',
  );

  static INVALID_PLACENAME = new ErrorCodes(400, '구장명을 입력해주세요.');

  static INVALID_RATE = new ErrorCodes(
    400,
    '별점은 1점부터 5점까지 매길 수 있습니다.',
  );

  static INVALID_REGION = new ErrorCodes(
    400,
    '리전을 두글자 이상 입력해주세요.',
  );

  static INVALID_TITLE = new ErrorCodes(
    400,
    '제목은 다섯글자 이상 입력해주세요.',
  );

  static MINIMUM_RATERS_REQUIRED = new ErrorCodes(
    400,
    '최소 한명 이상 평가를 해야합니다.',
  );

  static USER_PROFILE_NEEDED = new ErrorCodes(400, '프로필을 생성해주세요.');
  static MATCH_NOT_FINISHED = new ErrorCodes(
    400,
    '종료되지 않은 매치는 평가할 수 없습니다.',
  );
  static MATCH_SELF_PARTICIPATION = new ErrorCodes(
    400,
    '자신이 만든 경기에는 신청을 할 수 없습니다.',
  );
  static MATCH_PARTICIPATION_EXPIRED = new ErrorCodes(
    400,
    '자신이 만든 경기에는 신청을 할 수 없습니다.',
  );
  static MATCH_GENDER_MISMATCH = new ErrorCodes(
    400,
    '성별이 맞지 않는 경기에는 신청을 할 수 없습니다.',
  );
  static RATER_NOT_IN_MATCH = new ErrorCodes(
    403,
    '참여하지않은 매치는 평가할 수 없습니다.',
  );
  static MATCH_TIER_MISMATCH = new ErrorCodes(
    403,
    '자신의 티어와 맞지 않는 경기는 신청할 수 없습니다.',
  );
  static MATCH_EDIT_FORBIDDEN = new ErrorCodes(403, '수정 권한이 없습니다.');
  static MATCH_CANCEL_LOCKED = new ErrorCodes(
    403,
    '신청 정원이 80%를 초과하여 취소할 수 없습니다.',
  );

  static MATCH_NOT_FOUND = new ErrorCodes(404, '존재하지 않는 경기입니다.');
  static USER_NOT_IN_PARTICIPANTS = new ErrorCodes(
    404,
    '매치에 참여하지 않은 유저는 평가할 수 없습니다.',
  );
  static MATCH_INVALID_APPLICATION = new ErrorCodes(
    409,
    '신청할 수 없는 매치입니다.',
  );
  static MATCH_SELF_RATING = new ErrorCodes(409, '자신은 평가할 수 없습니다.');
  static MATCH_ALREADY_RATED = new ErrorCodes(409, '이미 평가한 유저입니다.');
  static MATCH_PARTICIPATION_REACHED_LIMIT = new ErrorCodes(
    409,
    '신청 가능한 인원을 초과하였습니다.',
  );

  // 사용자 관련 에러 코드
  static BANK_INFO_NEEDED = new ErrorCodes(400, '계좌를 확인해주세요.');

  static GENDER_TYPE_NEEDED = new ErrorCodes(400, '성별을 확인해주세요.');

  static INVALID_EMAIL_FORMAT = new ErrorCodes(
    400,
    '이메일 형식을 충족해야합니다',
  );

  static INVALID_NICKNAME = new ErrorCodes(
    400,
    '닉네임은 두 글자 이상 입력해주세요.',
  );

  static INVALID_PASSWORD_FORMAT = new ErrorCodes(
    400,
    '비밀번호는 대소문자와 특수문자가 최소 1개 이상 존재해야합니다',
  );

  static INVALID_PASSWORD_LENGTH = new ErrorCodes(
    400,
    '비밀번호는 8자 이상이어야 합니다',
  );

  static PHONE_NUMBER_NEEDED = new ErrorCodes(400, '연락처를 확인해주세요.');

  static USER_INVALID_CREDENTIAL = new ErrorCodes(
    401,
    '유효하지 않은 사용자 인증 정보입니다.',
  );
  static USER_UNAUTHORIZED = new ErrorCodes(
    401,
    '아이디 또는 패스워드가 일치하지 않습니다.',
  );
  static USER_INVALID_NICKNAME_CHANGE = new ErrorCodes(
    403,
    '닉네임 변경이 유효하지 않습니다.',
  );
  static USER_PROFILE_NOT_FOUND = new ErrorCodes(
    404,
    '프로필을 찾을 수 없습니다.',
  );
  static USER_NO_MATCHES_FOUND = new ErrorCodes(404, '최신 매치가 없습니다.');
  static SPORT_TYPE_NOT_FOUND = new ErrorCodes(404, '종목을 찾을 수 없습니다.');
  static USER_DUPLICATE = new ErrorCodes(409, '중복된 사용자입니다.');
  static USER_DUPLICATE_PROFILE = new ErrorCodes(
    409,
    '이미 프로필이 존재하는 유저입니다.',
  );
  static USER_DUPLICATE_PHONE_NUMBER = new ErrorCodes(
    409,
    '중복된 전화번호입니다.',
  );
  static USER_DUPLICATE_NICKNAME = new ErrorCodes(409, '중복된 닉네임입니다.');
}
