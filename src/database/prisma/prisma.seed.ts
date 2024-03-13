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
  getRandomMatchDay,
  getRandomNickName,
  getRandomOneLiner,
  getRandomPhoneNumber,
  getRandomRating,
  getRandomSports,
  getRandomSportsTypeId,
  getRandomTier,
  getRandomUserTier,
} from './getRandomData';
import { PrismaService } from './prisma.service';

const prismaService = new PrismaService();
const configService = new ConfigService();
const storageService = new GCSService(configService);

const sportsTypes = [
  { name: 'badminton' },
  { name: 'baseball' },
  { name: 'tennis' },
  { name: 'basketball' },
  { name: 'soccer' },
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
//         create: { name: sportType.name },
//       });
//     }),
//   );
// }
async function sportTypeSeed() {
  for (const sportType of sportsTypes) {
    await prismaService.sportsType.upsert({
      where: { name: sportType.name },
      update: {},
      create: { name: sportType.name },
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
  const sportsTypeId = await getRandomSportsTypeId();

  const {
    title,
    content,
    capability,
    latitude,
    longitude,
    placeName,
    region,
    address,
  } = getRandomSports(sportsTypeId);
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
