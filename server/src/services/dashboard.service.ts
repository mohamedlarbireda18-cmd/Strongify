import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class DashboardService {
async getStats(userId: string, period?: string) {
    const streak = await this.calculateStreak(userId);
    const currentWeight = await prisma.weightLog.findFirst({ where: { userId }, orderBy: { date: 'desc' } });

    let sessionsCount: number;
    if (period) {
        const since = new Date();
        switch (period) {
            case 'week': since.setDate(since.getDate() - 7); break;
            case '15days': since.setDate(since.getDate() - 15); break;
            case 'month': since.setMonth(since.getMonth() - 1); break;
            default: since.setMonth(since.getMonth() - 1);
        }
        sessionsCount = await prisma.workoutSession.count({
            where: { userId, date: { gte: since } }
        });
    } else {
        sessionsCount = await prisma.workoutSession.count({ where: { userId } });
    }

    return { streak, currentWeight: currentWeight?.weight ?? null, totalSessions: sessionsCount };
}

  async getOverallProgress(userId: string, sessions: number = 7) {
    const workouts = await prisma.workout.findMany({
      where: { userId },
      include: { exercises: { include: { exercise: true, sets: true } } },
      orderBy: { date: 'desc' },
      take: sessions
    });

    const progressByType: any = {};
    workouts.forEach(w => {
      if (!progressByType[w.type]) {
        progressByType[w.type] = { type: w.type, name: w.name, data: [] };
      }
      const volume = w.exercises.reduce((sum, we) => sum + we.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0);
      progressByType[w.type].data.unshift({ date: w.date, volume });
    });
    return Object.values(progressByType);
  }

  private async calculateStreak(userId: string): Promise<number> {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId },
    select: { date: true },
    orderBy: { date: 'desc' }
  });

  if (!sessions.length) return 0;

  let streak = 1;
  let cur = new Date(sessions[0].date);
  cur.setHours(0, 0, 0, 0);

  for (let i = 1; i < sessions.length; i++) {
    const d = new Date(sessions[i].date);
    d.setHours(0, 0, 0, 0);
    const diff = (cur.getTime() - d.getTime()) / 86400000;

    if (diff === 1) {
      streak++;
      cur = d;
    } else if (diff > 1) {
      break;
    }
  }

  return streak;
}
}