import { fakerKO as faker } from '@faker-js/faker';

import { Gender } from '@prisma/client';
import { PrismaService } from './prisma.service';

const prismaService = new PrismaService();

const commonPlaceName = [
  {
    placeName: '반포 종합운동장',
    latitude: 37.5005351,
    longitude: 126.9938763,
    region: '서울',
    address: '서울특별시 서초구 신반포로16길 30 (반포동)',
  },
  {
    placeName: '노량진',
    latitude: 37.5151799,
    longitude: 126.9410954,
    region: '서울',
    address: '서울특별시 동작구 노들로 688 (노량진동)',
  },
  {
    placeName: '난지 한강공원',
    latitude: 37.568435,
    longitude: 126.875951,
    region: '서울',
    address: '서울특별시 마포구 한강난지로 162 (상암동)',
  },
  {
    placeName: '망원 유수지',
    latitude: 37.55784,
    longitude: 126.8972554,
    region: '서울',
    address: '서울특별시 마포구 월드컵로25길 190 (망원동)',
  },
  {
    placeName: '잠실 유수지',
    latitude: 37.5031277,
    longitude: 127.0784893,
    region: '서울',
    address: '서울특별시 송파구 탄천동로 211 (잠실동)',
  },
  {
    placeName: '방배 배수지 체육공원',
    latitude: 37.4733242,
    longitude: 126.9925541,
    region: '서울',
    address: '서울특별시 서초구 남부순환로296길 4-9 (방배동)',
  },
  {
    placeName: '뚝섬한강공원',
    latitude: 37.52935069999999,
    longitude: 127.0699562,
    region: '서울',
    address: '서울특별시 광진구 강변북로 2273 (자양동)',
  },
  {
    placeName: '남산 근린공원',
    latitude: 36.4026965,
    longitude: 128.1534969,
    region: '경기',
    address: '경기 용인시 기흥구 서천동 802',
  },
  {
    placeName: '나곡 체육공원',
    latitude: 37.2552892,
    longitude: 127.1172788,
    region: '경기',
    address: '경기 용인시 기흥구 보라동 661',
  },
  {
    placeName: '삼산건강공원',
    latitude: 37.5173815,
    longitude: 126.7494593,
    region: '인천',
    address: '인천 부평구 영성동로18번길 48',
  },
  {
    placeName: '열우물 경기장',
    latitude: 37.4800962,
    longitude: 126.6919311,
    region: '인천',
    address: '인천 부평구 열우물로 164',
  },
  {
    placeName: '열우물 경기장',
    latitude: 37.3328625,
    longitude: 127.9944193,
    region: '강원',
    address: '강원 원주시 봉대길 108',
  },
  {
    placeName: '강릉 종합 운동장',
    latitude: 37.7731778,
    longitude: 128.8974154,
    region: '강원',
    address: '강원특별자치도 강릉시 종합운동장길 69',
  },
  {
    placeName: '하수 처리장 체육공원',
    latitude: 36.3825189,
    longitude: 127.4006599,
    region: '대전',
    address: '대전광역시 유성구 엑스포로 326 (원촌동)',
  },
  {

    placeName: '안영 생활체육공원',
    latitude: 36.2855308,
    longitude: 127.3734355,
    region: '대전',
    address: '대전 중구 안영동 561-1',
  },
  {
    placeName: '정부세종청사 스포츠센터',
    latitude: 36.5061727,
    longitude: 127.2576447,
    region: '세종',
    address: '세종 다솜1로 93',
  },
  {
    placeName: '천안 종합운동장',
    latitude: 36.8190769,
    longitude: 127.1148783,
    region: '충남',
    address: '충남 천안시 서북구 번영로 208 종합운동장',
  },
  {
    placeName: '이순신 종합운동장',
    latitude: 36.7681453,
    longitude: 127.0212148,
    region: '충남',
    address: '충남 아산시 남부로 370-24 이순신종합운동장',
  },
  {
    placeName: '꽃재공원',
    latitude: 36.620297,
    longitude: 127.4387291,
    region: '충북',
    address: '충북 청주시 흥덕구 장구봉로42번길 42',
  },
  {
    placeName: '제천 체육관',
    latitude: 37.1308908,
    longitude: 128.2151624,
    region: '충북',
    address: '충북 제천시 숭의로 85 제천시민광장',
  },
  {
    placeName: '다사체육공원',
    latitude: 35.8905147,
    longitude: 128.4789835,
    region: '대구',
    address: '대구 달성군 다사읍 다사로 441',
  },
  {
    placeName: '대구 성서 산업단지관리공단 다목적체육관',
    latitude: 35.8321633,
    longitude: 128.4958238,
    region: '대구',
    address: '대구 달서구 성서공단로22길 25',
  },
  {
    placeName: '경산 생활체육공원',
    latitude: 35.8201689,
    longitude: 128.7461845,
    region: '경북',
    address: '경북 경산시 상방동 9',
  },
  {
    placeName: '경주 안강 생활체육공원',
    latitude: 35.9857149,
    longitude: 129.2170773,
    region: '경북',
    address: '경북 경주시 안강읍 근계리 1418-474',
  },
  {
    placeName: '강서 체육공원',
    latitude: 35.209732,
    longitude: 128.9738117,
    region: '부산',
    address: '부산 강서구 체육공원로 43',
  },
  {
    placeName: '구덕 공설운동장',
    latitude: 35.1161439,
    longitude: 129.0150323,
    region: '부산',
    address: '부산 서구 망양로 57',
  },
  {
    placeName: '문수 국제경기장',
    latitude: 35.5322127,
    longitude: 129.271055,
    region: '울산',
    address: '울산 남구 남부순환도로 209',
  },
  {
    placeName: '야음 운동장',
    latitude: 35.5281523,
    longitude: 129.3368243,
    region: '울산',
    address: '울산 남구 화합로31번길 66',
  },
  {
    placeName: '어방 체육공원',
    latitude: 35.2420884,
    longitude: 128.8979935,
    region: '경남',
    address: '경남 김해시 어방동 657',
  },
  {
    placeName: '가마실공원',
    latitude: 35.2022208,
    longitude: 128.8007183,
    region: '경남',
    address: '경남 김해시 월산로 111-82',
  },
  {
    placeName: '광주 체육회관',
    latitude: 35.1187005,
    longitude: 126.8822462,
    region: '광주',
    address: '광주 서구 금화로278(풍암동 423-2)',
  },
  {
    placeName: '빛고을체육관',
    latitude: 35.13336080000001,
    longitude: 126.8778261,
    region: '광주',
    address: '광주 서구 금화로 278',
  },
  {
    placeName: '무안 스포츠 파크',
    latitude: 35.0164047,
    longitude: 126.4271698,
    region: '전남',
    address: '전남 무안군 현경면 공항로 345',
  },
  {
    placeName: '중마 근린공원',
    latitude: 34.9427229,
    longitude: 127.6968132,
    region: '전남',
    address: '전남 광양시 중동 1320',
  },
  {
    placeName: '순창 공설운동장',
    latitude: 35.3699652,
    longitude: 127.1287642,
    region: '전북',
    address: '전북 순창군 순창읍 교성리 196-25',
  },
  {
    placeName: '성산 국민체육센터',
    latitude: 33.4672487,
    longitude: 126.9055504,
    region: '제주',
    address: '제주 서귀포시 성산읍 일주동로 4024',
  },
];
const specificPlaceNames = {
  1: [
    '배드민턴장 1번 코트',
    '배드민턴장 2번 코트',
    '배드민턴장 3번 코트',
    '배드민턴장 4번 코트',
  ],
  2: ['성인야구장', '리틀야구장', '야구장'],
  3: [
    '소프트 테니스장',
    '테니스장 1번코트',
    '테니스장 2번코트',
    '테니스장 3번코트',
    '테니스장 4번코트',
    '테니스장 5번코트',
    '테니스장 A코트',
    '테니스장 B코트',
    '테니스장 C코트',
  ],
  4: ['농구장1', '농구장2', '농구장3', '농구장4'],
  5: [
    'EA SPORTS FC(더에프필드)',
    '축구장',
    '월드컵 보조경기장',
    '여성축구장',
    '노들나루공원 축구장',
    '인조잔디 축구장',
  ],
};

const sportsCapabilities = {
  1: [2, 4],
  2: [16, 18, 20],
  3: [2, 4],
  4: [6, 8, 10],
  5: [10, 12, 14, 16, 18, 20, 22],
};

const oneLiners = [
  '매너 있게 플레이합시다!',
  '같은 취미를 가진 사람들과 만나고 싶어요.',
  '주말 아침 축구 게임에 참여해요. 같이 뛰어봐요!',
  '정정당당한 경기를 원해요.',
  '초보라서... 조금만 봐주세요!',
  '성장하는 모습을 보고 싶어요.',
  '퇴근 후 저녁에 주로 플레이해요!',
  '비슷한 실력의 상대와 경기하고 싶어요.',
  '스포츠로 새로운 친구를 만들고 싶어요.',
  '퇴근 후 저녁에 주로 농구해요!',
  '함께 운동하면서 즐길 사람 찾아요!',
  '배드민턴 칠 파트너 구합니다. 초보 환영!',
  '운동으로 스트레스 풀고 싶어요. 동참하실 분?',
  '실력 향상, 함께 목표해요.',
  '함께 땀 흘리며 즐겨요!',
  '건강도 챙기고 새 친구도 만들고 싶어요!',
  '테니스 좋아하는 사람 여기 모여라!',
];

function getRandomIndex(length: number): number {
  return Math.floor(Math.random() * length);
}

export function getRandomEmail() {
  const randomNumber = Math.floor(Math.random() * 1000000) + 1;
  const email = `test${randomNumber}@test.com`;
  return email;
}

export async function getRandomUserTier() {
  const tiers = await prismaService.tier.findMany();
  const randomTiers = [];
  for (let sportsTypeId = 1; sportsTypeId <= 5; sportsTypeId++) {
    const filteredTiers = tiers.filter(
      (tier) => tier.sportsTypeId === sportsTypeId,
    );
    if (filteredTiers.length > 0) {
      randomTiers.push(filteredTiers[getRandomIndex(filteredTiers.length)]);
    }
  }
  return randomTiers;
}

export function getRandomGender(): Gender {
  const genders: Gender[] = [Gender.male, Gender.female, Gender.both];
  return genders[getRandomIndex(genders.length)];
}

export function getRandomPhoneNumber() {
  let phoneNumber = '010';
  for (let i = 0; i < 8; i++) {
    const digit = Math.floor(Math.random() * 9) + 1;
    phoneNumber += digit;
  }
  return phoneNumber;
}

export function getRandomNickName() {
  const nickNameRegex = /,|\s/g;
  const fullName =
    faker.word.adjective().replace(nickNameRegex, '') +
    faker.person.lastName().replace(nickNameRegex, '') +
    faker.person.firstName().replace(nickNameRegex, '');
  return fullName;
}

export function getRandomImg() {
  return faker.image.avatarLegacy();
}

export function getRandomOneLiner() {
  return oneLiners[getRandomIndex(oneLiners.length)];
}

export function getRandomBankName() {
  const bankName = ['국민', '우리', '하나', '신한', '농협', '수협'];
  return bankName[getRandomIndex(bankName.length)] + '은행';
}

export function getRandomAccountNumber() {
  let accountNumber = '';
  for (let i = 0; i < 14; i++) {
    const digit = Math.floor(Math.random() * 9) + 1;
    accountNumber += digit;
  }
  return accountNumber;
}

export function getRandomMatchDay() {
  const startDate = new Date(2024, 2, 6);
  const endDate = new Date(2024, 2, 27);

  const randomDate = faker.date.between({ from: startDate, to: endDate });

  const randomHour = faker.number.int({ min: 6, max: 23 });
  const randomMin = faker.number.int({ min: 0, max: 1 }) * 30;

  randomDate.setHours(randomHour, randomMin, 0);
  return randomDate;
}

export async function getRandomSportsTypeId() {
  const sportsTypes = await prismaService.sportsType.findMany({
    select: { id: true, name: true },
  });
  const sportsNameToTypeId = {
    badminton: 1,
    baseball: 2,
    tennis: 3,
    basketball: 4,
    soccer: 5,
  };

  const randomSportsTypeName =
    sportsTypes[getRandomIndex(sportsTypes.length)].name;
  return sportsNameToTypeId[randomSportsTypeName];
}

export function getRandomSports(sportTypeId: number) {
  const common = commonPlaceName[getRandomIndex(commonPlaceName.length)];
  const specificNames = specificPlaceNames[sportTypeId];
  const specific = specificNames[getRandomIndex(specificNames.length)];

  const capabilityNames = sportsCapabilities[sportTypeId];
  const capability = capabilityNames[getRandomIndex(capabilityNames.length)];

  return {
    title: `${common.placeName} ${specific}`,
    content: `${common.placeName}, ${specific}. 수용인원 : ${capability}.`,
    capability: capability,
    latitude: common.latitude,
    longitude: common.longitude,
    placeName: specific,
    region: common.region,
    address: common.address,
  };
}

export async function getRandomTier(sportsTypeId: number, hostId: string) {
  const hostTier = await prismaService.user.findUnique({
    where: { id: hostId },
    include: {
      tiers: true,
    },
  });

  const randomTier = hostTier.tiers.find(
    (tier) => tier.sportsTypeId === sportsTypeId,
  );
  return randomTier.id;
}

export async function getRandomMatches(hostId) {
  const sportsTypeId = await getRandomSportsTypeId();
  const tier = getRandomTier(sportsTypeId, hostId);

  const matchData = getRandomSports(sportsTypeId);

  return { sportsTypeId, tier, ...matchData };
}

export function getRandomRating() {
  const rating = [1, 2, 3, 4, 5];
  return rating[getRandomIndex(rating.length)];
}
