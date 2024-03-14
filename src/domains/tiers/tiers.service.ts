import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from './../../database/prisma/prisma.service';

@Injectable()
export class TiersService {
  constructor(private readonly prismaService: PrismaService) {}

  async getTiers() {
    return await this.prismaService.tier.findMany({
      distinct: ['value'],
      select: { value: true, description: true },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async fetchTiersEveryDay() {
    await this.fetchTiers();
  }

  // 매일사용자별 스포츠 타입에 따른 티어를 계산하고 업데이트하는 함수
  async fetchTiers() {
    // 모든 스포츠 타입 ID를 가져옴
    const sportsTypeIds = await this.prismaService.sportsType.findMany({
      select: { id: true },
    });

    // 스포츠 타입 ID별로 사용자를 랭킹하기 위한 객체 초기화
    const rankBySportsTypeIds = sportsTypeIds.reduce(
      (accumulator, sportsType) => {
        accumulator[sportsType.id] = [];
        return accumulator;
      },
      {},
    );

    // 모든 사용자와 그들의 평가 점수를 가져옴
    const users = await this.prismaService.user
      .findMany({
        select: {
          id: true,
          ratedScore: {
            select: {
              value: true,
              match: {
                select: {
                  sportsTypeId: true,
                },
              },
            },
          },
        },
      })
      .then((users) => {
        // 각 사용자별로 점수 분석을 수행
        return users.map((user) => ({
          id: user.id,
          scoreAnalysis: this.scoreAnalysis(user.ratedScore),
        }));
      });

    // 분석된 점수를 바탕으로 사용자를 스포츠 타입 ID별로 분류
    users.forEach((user) => {
      Object.keys(user.scoreAnalysis).forEach((sportsTypeId) => {
        rankBySportsTypeIds[sportsTypeId].push(user.id);
      });
    });

    // 각 스포츠 타입별로 사용자를 평균 점수에 따라 정렬
    Object.keys(rankBySportsTypeIds).forEach((sportsTypeId) => {
      rankBySportsTypeIds[sportsTypeId] = rankBySportsTypeIds[
        sportsTypeId
      ].sort(
        (userA: { averageScore: number }, userB: { averageScore: number }) =>
          userB.averageScore - userA.averageScore,
      );
    });

    // 사용자별로 티어를 계산하여 업데이트
    Object.keys(rankBySportsTypeIds).forEach((sportsTypeId) => {
      const usersCount = rankBySportsTypeIds[sportsTypeId].length;
      rankBySportsTypeIds[sportsTypeId] = rankBySportsTypeIds[sportsTypeId].map(
        (userId: string, index: number) => {
          let tier: string;
          if (index / usersCount <= 0.1) tier = 'master';
          else if (index / usersCount <= 0.3) tier = 'pro';
          else if (index / usersCount <= 0.6) tier = 'semi-pro';
          else tier = 'amateur';
          return { userId, tier };
        },
      );
    });

    // 계산된 티어를 바탕으로 사용자 정보를 업데이트
    for (const sportsTypeId in rankBySportsTypeIds) {
      const users = rankBySportsTypeIds[sportsTypeId];

      users.forEach(async (user) => {
        // 사용자의 현재 티어 정보를 찾음
        const foundUser = await this.prismaService.user.findUnique({
          where: { id: user.userId },
          include: {
            tiers: {
              select: {
                id: true,
                value: true,
                sportsTypeId: true,
              },
            },
          },
        });

        // 해당 스포츠 타입에 대한 이전 티어 연결을 해제
        foundUser.tiers
          .filter((tier) => tier.sportsTypeId === parseInt(sportsTypeId))
          .forEach(
            async (tier) =>
              await this.prismaService.user.update({
                where: { id: user.userId },
                data: {
                  tiers: {
                    disconnect: {
                      id: tier.id,
                    },
                  },
                },
              }),
          ),
          // 새로운 티어로 업데이트
          await this.prismaService.user.update({
            where: { id: user.userId },
            data: {
              tiers: {
                connect: {
                  value_sportsTypeId: {
                    value: user.tier,
                    sportsTypeId: parseInt(sportsTypeId),
                  },
                },
              },
            },
          });
      });
    }
  }

  // 사용자의 평가 점수를 분석하여 스포츠 타입별 평균 점수를 계산하는 함수
  scoreAnalysis(
    ratedScores: { value: number; match: { sportsTypeId: number } }[],
  ) {
    const result = {};

    ratedScores.forEach(
      (ratedScore: { value: number; match: { sportsTypeId: number } }) => {
        const sportsTypeId = ratedScore.match.sportsTypeId;
        const value = ratedScore.value;

        if (result[sportsTypeId]) {
          result[sportsTypeId].sum += value;
          result[sportsTypeId].count++;
        } else {
          result[sportsTypeId] = { sum: value, count: 1 };
        }
      },
    );

    // 최소 3개의 평가 점수를 받은 스포츠 타입에 대해서만 평균 점수를 계산
    const filteredResult = Object.keys(result)
      .filter((sportsTypeId) => result[sportsTypeId].count >= 3)
      .reduce((acc, sportsTypeId) => {
        acc[sportsTypeId] = parseFloat(
          (result[sportsTypeId].sum / result[sportsTypeId].count).toFixed(2),
        );
        return acc;
      }, {});

    return filteredResult;
  }
}
