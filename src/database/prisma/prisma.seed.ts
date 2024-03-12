import { ConfigService } from '@nestjs/config';
import { UserProfile } from '@prisma/client';
import { nanoid } from 'nanoid';
import {
  getRandomAccountNumber,
  getRandomBankName,
  getRandomEmail,
  getRandomGender,
  getRandomMatchDay,
  getRandomNickName,
  getRandomPhoneNumber,
  getRandomSports,
  getRandomSportsTypeId,
  getRandomTier,
  getRandomUserTier,
} from './getRandomData';
import { PrismaService } from './prisma.service';

const prismaService = new PrismaService();
const configService = new ConfigService();

const sportsTypes = [
  { name: 'tennis' },
  { name: 'soccer' },
  { name: 'basketball' },
  { name: 'baseball' },
  { name: 'badminton' },
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

async function sportTypeSeed() {
  await Promise.all(
    sportsTypes.map(async (sportType) => {
      await prismaService.sportsType.upsert({
        where: { name: sportType.name },
        update: {},
        create: { name: sportType.name },
      });
    }),
  );
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
      encryptedPassword: 'testPassword!',
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
    },
  });
  console.log(userProfile);
  return userProfile;
}

async function matchSeed(hostId: string) {
  const sportsTypeId = await getRandomSportsTypeId();

  const { title, content, capability, latitude, longitude, placeName, region } =
    getRandomSports(sportsTypeId);
  const tierId = await getRandomTier(sportsTypeId, hostId);
  const randomDate = new Date(getRandomMatchDay());
  const match = await prismaService.match.create({
    data: {
      id: nanoid(configService.get('NANOID_SIZE')),
      hostId: hostId,
      participants: {
        connect: {
          id: hostId,
        },
      },
      sportsTypeId,
      tierId,
      title,
      content,
      gender: getRandomGender(),
      capability,
      latitude,
      longitude,
      placeName,
      region,
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
      console.log('참가여');
      console.log(participating);
    }
  }
}
/**
 * 1. matchDay 가 현재 시간이전
 * 2.참가자 1명이 나머지 참가자 전부 평가
 * 3.
 */
// async function ratingSeed() {

// }

async function seed() {
  const userArray: UserProfile[] = [];
  await sportTypeSeed().then(tierSeed);
  for (let i = 0; i < 40; i++) {
    const userProfile = await userSeed();
    userArray.push(userProfile);
    for (let j = 0; j < 2; j++) {
      await matchSeed(userProfile.userId);
    }
  }
  for (let k = 0; k < userArray.length; k++) {
    await participateSeed(userArray[k].userId);
  }
}
seed();
