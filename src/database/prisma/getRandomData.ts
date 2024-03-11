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
  },
  {
    placeName: '노량진',
    latitude: 37.5151799,
    longitude: 126.9410954,
    region: '서울',
  },
  {
    placeName: '난지 한강공원',
    latitude: 37.568435,
    longitude: 126.875951,
    region: '서울',
  },
  {
    placeName: '망원 유수지',
    latitude: 37.55784,
    longitude: 126.8972554,
    region: '서울',
  },
  {
    placeName: '잠실 유수지',
    latitude: 37.5031277,
    longitude: 127.0784893,
    region: '서울',
  },
  {
    placeName: '방배 배수지 체육공원',
    latitude: 37.4733242,
    longitude: 126.9925541,
    region: '서울',
  },
  {
    placeName: '뚝섬한강공원',
    latitude: 37.52935069999999,
    longitude: 127.0699562,
    region: '서울',
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
  const genders: Gender[] = [Gender.male, Gender.female];
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
  return faker.person.fullName();
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
  const startDate = new Date(2024, 2, 1);
  const endDate = new Date(2024, 3, 30);

  const randomDate = faker.date.between(startDate, endDate);

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
  };
}
//TODO
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

// export function getRandomDistrict() {
//   const district = [
//     '종로구',
//     '중구',
//     '용산구',
//     '성동구',
//     '광진구',
//     '동대문구',
//     '중랑구',
//     '성북구',
//     '강북구',
//     '도봉구',
//     '노원구',
//     '은평구',
//     '서대문구',
//     '마포구',
//     '양천구',
//     '강서구',
//     '구로구',
//     '금천구',
//     '영등포구',
//     '동작구',
//     '관악구',
//     '서초구',
//     '강남구',
//     '송파구',
//     '강동구',
//   ];

//   return district[getRandomIndex(district.length)];
// }
