import { ConfigService } from '@nestjs/config';
import { UserProfile } from '@prisma/client';
import axios from 'axios';
import { hash } from 'bcrypt';
import { nanoid } from 'nanoid';
import { GCSService } from '../../storage/google/gcs.service';
import {
  getRandomAccountNumber,
  getRandomBankName,
  getRandomEmail,
  getRandomGender,
  getRandomImg,
  getRandomMatches,
  getRandomNickName,
  getRandomOneLiner,
  getRandomPhoneNumber,
  getRandomRating,
  getRandomUserTier,
} from './getRandomData';
import { PrismaService } from './prisma.service';

const prismaService = new PrismaService();
const configService = new ConfigService();
const storageService = new GCSService(configService);

const sportsTypes = [
  {
    name: 'badminton',
    rules: `1. 경기장과 네트: 배드민턴 코트는 직사각형 형태로, 단식에서는 너비가 좁고 복식에서는 넓습니다. 네트의 높이는 코트 중앙에서 1.524미터입니다.
    2. 경기 방식: 배드민턴 경기는 셔틀콕을 상대방 코트 바닥에 떨어뜨리는 방식으로 점수를 얻습니다. 경기는 보통 3세트 중 2세트를 먼저 따는 팀이 이깁니다.
    3. 서브: 서브는 경기를 시작하고 각 점수를 얻을 때마다 진행됩니다. 서브하는 선수는 발을 움직이지 않고, 셔틀콕을 아래에서 위로 치면서 서브해야 합니다.
    4. 점수 계산: 각 게임은 21점을 먼저 따는 선수 또는 팀이 승리합니다. 20-20이 되면, 2점 차이가 날 때까지 게임이 계속됩니다. 최대 29-29에서 다음 점수를 얻는 선수/팀이 승리합니다.
    5. 교체와 위치: 경기 중에 선수 교체는 허용되지 않습니다. 서브와 리시브 위치는 점수에 따라 정해지며, 게임 중 이를 준수해야 합니다.
  `,
  },
  {
    name: 'baseball',
    rules: `1. 경기 진행: 야구는 9이닝으로 구성되며, 각 이닝은 공격과 수비로 나뉩니다. 팀마다 3아웃이 발생할 때까지 공격 기회를 가집니다.
    2. 경기장: 야구장은 내야와 외야, 그리고 홈 플레이트를 중심으로 하는 베이스(1루, 2루, 3루)로 구성됩니다.
    3. 타격과 주루: 타자가 공을 치고 베이스를 돌아 홈 플레이트로 돌아오면 1점(홈런)을 얻습니다. 타자는 안타, 2루타, 3루타 또는 홈런을 칠 수 있습니다.
    4. 아웃: 타자가 삼진아웃, 비디오아웃, 태그아웃 등으로 아웃됩니다. 수비 팀은 세 명의 타자를 아웃시켜 공격권을 얻습니다.
    5. 점수 계산: 홈 플레이트를 통과한 선수가 점수를 얻습니다. 경기 종료 시 더 많은 점수를 얻은 팀이 승리합니다.
  `,
  },
  {
    name: 'tennis',
    rules: `1. 경기장: 테니스 코트는 직사각형 모양으로, 단식과 복식 경기에 따라 너비가 다릅니다. 네트는 코트의 중앙에 위치합니다.
    2. 경기 방식: 테니스는 상대방 코트에 공을 치고 상대방이 반환하지 못하게 하는 방식으로 점수를 얻습니다. 경기는 세트로 구성되며, 보통 3세트 또는 5세트 중 다수를 이긴 선수가 승리합니다.
    3. 서브: 각 게임의 시작은 서브로 시작됩니다. 서브하는 선수는 두 번의 기회를 가지며, 첫 번째 서브 실패 후에는 두 번째 서브를 시도할 수 있습니다.
    4. 점수 계산: 게임 점수는 0(러브), 15, 30, 40 순으로 올라가며, 듀스가 되면 양측이 한 점씩 번갈아 가며 얻을 때까지 계속됩니다. 세트 점수는 게임을 이긴 횟수로 계산됩니다.
    5. 파울: 발을 움직이는 등의 서브 파울, 공을 두 번 이상 치는 것, 네트에 닿는 것 등이 포함됩니다. 파울 시 상대방에게 점수가 부여됩니다.
  `,
  },
  {
    name: 'basketball',
    rules: `1. 경기 시간: 농구 경기는 보통 4쿼터로 구성되며, 각 쿼터는 10분 또는 12분입니다. 쿼터 사이와 하프타임에는 휴식 시간이 있습니다.
    2. 경기장: 농구 코트는 직사각형 모양이며, 양 끝에는 골대가 있습니다. 골대는 바닥에서 3.05미터 높이에 위치한 농구 골링과 네트로 구성됩니다.
    3. 선수: 경기는 각 팀 5명의 선수로 진행됩니다. 경기 중 무제한 교체가 가능합니다.
    4. 점수 계산: 필드골은 2점, 3점 라인 밖에서 던진 골은 3점, 자유투는 1점입니다.
    5. 파울과 벌칙: 개인 파울과 기술 파울이 있으며, 일정 수의 파울이 쌓이면 상대 팀에게 자유투 기회가 주어집니다.
  `,
  },
  {
    name: 'soccer',
    rules: `1. 경기 시간: 축구 경기는 전반과 후반, 각각 45분씩 총 90분 동안 진행됩니다. 경기 중 발생한 중단 시간은 추가 시간으로 보상됩니다.
    2. 경기장: 축구 경기장은 직사각형 모양이며, 국제 경기의 경우 길이는 100~~110미터, 너비는 64~~75미터로 규정되어 있습니다.
    3. 선수: 각 팀은 골키퍼 포함 11명의 선수로 구성됩니다. 경기 중 3명까지 교체 선수를 투입할 수 있습니다.
    4. 골: 공이 상대방 골라인을 완전히 통과하면 골로 인정되며, 더 많은 골을 넣은 팀이 승리합니다.
    5. 파울과 벌칙: 핸드볼, 반칙 태클 등 파울 시 직접 또는 간접 프리킥을 부여하며, 페널티 박스 내에서의 파울은 페널티 킥으로 이어질 수 있습니다.
  `,
  },
];

const tiers = [
  {
    value: 'beginner',
    description:
      '운동 여정의 첫발을 딛고, 기본기를 다지며 더 큰 도전을 준비하는 단계',
  },
  {
    value: 'amateur',
    description: '기본기를 갖추고, 운동에 대한 열정이 싹트기 시작한 단계',
  },
  {
    value: 'semi-pro',
    description: '운동에 대한 깊은 이해를 갖추고, 한계를 시험하는 단계',
  },
  {
    value: 'pro',
    description: '높은 수준의 기술과 경험을 갖춘 전문가',
  },
  {
    value: 'master',
    description: '마침내 해당 분야의 정점에 서게 된 진정한 마스터',
  },
];

// async function sportTypeSeed() {
//   await Promise.all(
//     sportsTypes.map(async (sportType) => {
//       await prismaService.sportsType.upsert({
//         where: { name: sportType.name },
//         update: {},
//         create: { name: sportType.name, rules: sportType.rules },
//       });
//     }),
//   );
// }
async function sportTypeSeed() {
  for (const sportType of sportsTypes) {
    await prismaService.sportsType.upsert({
      where: { name: sportType.name },
      update: {},
      create: { name: sportType.name, rules: sportType.rules },
    });
  }
}

async function tierSeed() {
  const allSportsTypes = await prismaService.sportsType.findMany();
  for (const sportType of allSportsTypes) {
    await Promise.all(
      tiers.map(async (tier) => {
        await prismaService.tier.upsert({
          where: {
            value_sportsTypeId: {
              value: tier.value,
              sportsTypeId: sportType.id,
            },
          },
          update: {},
          create: {
            id: nanoid(configService.get('NANOID_SIZE')),
            value: tier.value,
            description: tier.description,
            sportsTypeId: sportType.id,
          },
        });
      }),
    );
  }
}

async function userSeed() {
  const testId = nanoid(configService.get('NANOID_SIZE'));
  const email = getRandomEmail();
  const password = 'testPassword!';
  const encryptedPassword = await hash(
    password,
    parseInt(configService.get('HASH_SALT')),
  );

  const randomTiers = await getRandomUserTier();
  const connectTiers = randomTiers.map((tier) => ({
    id: tier.id,
  }));

  const user = await prismaService.user.upsert({
    where: { email },
    update: {},
    create: {
      id: testId,
      email,
      encryptedPassword,
      tiers: {
        connect: connectTiers,
      },
    },
  });
  console.log(user);

  const userProfile = await prismaService.userProfile.upsert({
    where: { userId: testId },
    update: {},
    create: {
      userId: testId,
      gender: getRandomGender(),
      phoneNumber: getRandomPhoneNumber(),
      nickName: getRandomNickName(),
      bankName: getRandomBankName(),
      accountNumber: getRandomAccountNumber(),
      oneLiner: getRandomOneLiner(),
    },
  });

  const randomImageUrl = getRandomImg();

  const randomImageBuffer: Buffer = await axios
    .get<ArrayBuffer>(randomImageUrl, {
      responseType: 'arraybuffer',
    })
    .then((response) => Buffer.from(response.data));

  const imageFile: Parameters<typeof storageService.uploadImage>[1] = {
    buffer: randomImageBuffer,
    originalname: `${randomImageUrl}`,
  };
  const imgUpload = await storageService.uploadImage(testId, imageFile);
  console.log(imgUpload);

  return userProfile;
}

async function matchSeed(hostId: string) {
  const {
    randomSportsTypeId,
    randomDate,
    tierId,
    title,
    content,
    capability,
    latitude,
    longitude,
    placeName,
    region,
    address,
  } = await getRandomMatches(hostId);

  const match = await prismaService.match.create({
    data: {
      id: nanoid(configService.get('NANOID_SIZE')),
      hostId: hostId,
      participants: {
        connect: {
          id: hostId,
        },
      },
      sportsTypeId: randomSportsTypeId,
      tierId,
      title,
      content,
      gender: getRandomGender(),
      capability,
      latitude,
      longitude,
      placeName,
      region,
      address,
      matchDay: randomDate,
      createdAt: randomDate,
      updatedAt: randomDate,
    },
  });
  return match;
}
/**
1. userId.gender 일치검사
2. userId.tier 일치검사
3. participants.length < 케파
4. hostId !== userId
 */
async function participateSeed(userId) {
  const user = await prismaService.user.findUnique({
    where: { id: userId },
    include: { userProfile: true, tiers: true },
  });
  if (!user || !user.userProfile) return;

  const userTierIds = user.tiers.map((tier) => tier.id);

  const matches = await prismaService.match.findMany({
    where: {
      AND: [
        {
          OR: [{ gender: user.userProfile.gender }, { gender: 'both' }],
        },
        { hostId: { not: userId } },
        { tierId: { in: userTierIds } },
      ],
    },
    include: {
      participants: true,
    },
  });

  const eligibleMatches = matches.filter(
    (match) => match.participants.length < match.capability,
  );

  for (const match of eligibleMatches) {
    const alreadyParticipating = match.participants.some(
      (participant) => participant.id === userId,
    );
    if (!alreadyParticipating) {
      const participating = await prismaService.match.update({
        where: { id: match.id },
        data: {
          participants: {
            connect: { id: userId },
          },
        },
      });
      console.log('참가');
      console.log(participating);
    }
  }
}
/**
 * 1. matchDay 가 현재 시간이전
 * 2.참가자 1명이 나머지 참가자 전부 평가
 * 3.
 */
async function ratingSeed() {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 1);
  const yesterday = new Date(currentDate);
  const matches = await prismaService.match.findMany({
    include: { participants: true, rate: true },
    where: { matchDay: { lt: yesterday } },
  });
  for (const match of matches) {
    for (const rater of match.participants) {
      for (const participant of match.participants) {
        const raterId = rater.id;
        const userId = participant.id;

        if (raterId !== userId) {
          const rating = await prismaService.rating.create({
            data: {
              id: nanoid(configService.get('NANOID_SIZE')),
              userId,
              raterId,
              matchId: match.id,
              value: getRandomRating(),
            },
          });
          console.log(rating);
        }
      }
    }
  }
}

async function seed() {
  const userArray: UserProfile[] = [];
  await sportTypeSeed().then(tierSeed);
  for (let i = 0; i < 100; i++) {
    const userProfile = await userSeed();
    userArray.push(userProfile);
    for (let j = 0; j < 3; j++) {
      await matchSeed(userProfile.userId);
    }
  }
  for (let k = 0; k < userArray.length; k++) {
    await participateSeed(userArray[k].userId);
  }
  ratingSeed();
}
seed();
