import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prismaClient = new PrismaClient();
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
    sportsTypes.map((sportType) => {
      prismaClient.sportsType.upsert({
        where: { name: sportType.name },
        update: {},
        create: { name: sportType.name },
      });
    }),
  );
}

async function tierSeed() {
  const allSportsTypes = await prismaClient.sportsType.findMany();
  for (const sportType of allSportsTypes) {
    await Promise.all(
      tiers.map(async (tier) => {
        const result = await prismaClient.tier.upsert({
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
        console.log(result);
      }),
    );
  }
}
async function seed() {
  await sportTypeSeed().then(tierSeed);
}
seed();
//   for (const sportType of sportsTypes) {
//     await prismaClient.sportsType.upsert({
//       where: { name: sportType.name },
//       update: {},
//       create: { name: sportType.name },
//     });
//   }
//   const allSportsTypes = await prismaClient.sportsType.findMany();

//   for (const tier of tiers) {
//     for (const sportType of allSportsTypes) {
//       await prismaClient.tier.upsert({
//         where: { value: tier.value },
//         update: {},
//         create: {
//           id: nanoid(configService.get('NANOID_SIZE')),
//           value: tier.value,
//           description: tier.description,
//           sportsTypeId: sportType.id,
//         },
//       });
//     }
//   }
// }
// seed();
