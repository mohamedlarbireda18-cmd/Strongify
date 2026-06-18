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
  // Récupérer toutes les dates d'activité (workout sessions + calorie logs + weight logs)
  const [workoutSessions, calorieLogs, weightLogs] = await Promise.all([
    prisma.workoutSession.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: 'desc' }
    }),
    prisma.calorieLog.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: 'desc' }
    }),
    prisma.weightLog.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: 'desc' }
    })
  ]);

  // Fusionner toutes les dates et les normaliser à minuit
  const allDates = [
    ...workoutSessions.map(s => s.date),
    ...calorieLogs.map(l => l.date),
    ...weightLogs.map(l => l.date)
  ].map(d => {
    const normalized = new Date(d);
    normalized.setHours(0, 0, 0, 0);
    return normalized.getTime();
  });

  // Dédupliquer les dates
  const uniqueDates = [...new Set(allDates)].sort((a, b) => b - a);

  if (uniqueDates.length === 0) return 0;

  // Calculer le streak
  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  // Vérifier si l'utilisateur a été actif aujourd'hui ou hier
  const lastActiveDate = uniqueDates[0];
  const oneDay = 86400000; // 24h en ms

  // Si la dernière activité date de plus d'un jour, le streak est rompu
  if (todayTime - lastActiveDate > oneDay) return 0;

  let currentDate = lastActiveDate;

  for (let i = 1; i < uniqueDates.length; i++) {
    const previousDate = uniqueDates[i];
    const diff = (currentDate - previousDate) / oneDay;

    if (diff === 1) {
      streak++;
      currentDate = previousDate;
    } else if (diff > 1) {
      break;
    }
    // Si diff === 0 (même jour), on continue sans incrémenter
  }

  return streak;
}
}