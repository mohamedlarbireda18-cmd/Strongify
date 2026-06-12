import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class BodyService {
  async addWeightLog(userId: string, weight: number) {
    return prisma.weightLog.create({ data: { userId, weight } });
  }

  async getWeightLogs(userId: string, days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return prisma.weightLog.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: 'asc' }
    });
  }

  async getCurrentWeight(userId: string) {
    const log = await prisma.weightLog.findFirst({ where: { userId }, orderBy: { date: 'desc' } });
    return log?.weight ?? null;
  }
}