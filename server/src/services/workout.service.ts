import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class WorkoutService {

  // Récupérer les workouts templates
  async getUserWorkouts(userId: string) {
    return prisma.workout.findMany({
      where: { userId },
      include: {
        exercises: { include: { exercise: true } },
        sessions: { select: { id: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  // Récupérer un workout par ID
  async getWorkoutById(workoutId: string, userId: string) {
    const workout = await prisma.workout.findFirst({
      where: { id: workoutId, userId },
      include: {
        exercises: { include: { exercise: true }, orderBy: { order: 'asc' } },
        sessions: {
          include: {
            exercises: {
              include: { exercise: true, sets: { orderBy: { setNumber: 'asc' } } },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { date: 'asc' }
        }
      }
    });
    if (!workout) throw new Error('Workout not found.');
    return workout;
  }

  // Créer un workout template
  async createWorkout(userId: string, data: { name: string; type: string; exercises: { exerciseId: string; order: number }[] }) {
    return prisma.workout.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        exercises: {
          create: data.exercises.map(ex => ({
            exerciseId: ex.exerciseId,
            order: ex.order
          }))
        }
      },
      include: { exercises: { include: { exercise: true } } }
    });
  }

  // Ajouter une session à un workout
  async addSession(workoutId: string, userId: string, data: { exercises: { exerciseId: string; sets: { weight: number; reps: number; isDropSet?: boolean; isMicroReps?: boolean; notes?: string }[]; notes?: string }[] }) {
    
    const workout = await prisma.workout.findFirst({
      where: { id: workoutId, userId }
    });
    if (!workout) throw new Error('Workout not found.');

    let totalVolume = 0;
    data.exercises.forEach(ex => ex.sets.forEach(set => totalVolume += set.weight * set.reps));

    const session = await prisma.workoutSession.create({
      data: {
        workoutId,
        userId,
        date: new Date(),
        totalVolume,
        exercises: {
          create: data.exercises.map((ex, idx) => ({
            exerciseId: ex.exerciseId,
            order: idx + 1,
            notes: ex.notes,
            sets: {
              create: ex.sets.map((set, i) => ({
                setNumber: i + 1,
                weight: set.weight,
                reps: set.reps,
                isDropSet: set.isDropSet || false,
                isMicroReps: set.isMicroReps || false,
                notes: set.notes
              }))
            }
          }))
        }
      },
      include: {
        exercises: {
          include: { exercise: true, sets: true }
        }
      }
    });

    return session;
  }

  // Progression par exercice
async getWorkoutProgress(workoutId: string, userId: string, sessions: number = 7) {
  const workout = await prisma.workout.findFirst({
    where: { id: workoutId, userId }
  });
  if (!workout) throw new Error('Workout not found.');

  // Récupérer les N sessions les plus récentes (ordre descendant)
  const recentSessions = await prisma.workoutSession.findMany({
    where: { workoutId, userId },
    include: {
      exercises: {
        include: { exercise: true, sets: true }
      }
    },
    orderBy: { date: 'desc' },
    take: sessions
  });

  // Inverser pour avoir l'ordre chronologique (ancien → récent)
  recentSessions.reverse();

  const progressByExercise: any = {};
  recentSessions.forEach(session => {
    session.exercises.forEach(se => {
      if (!progressByExercise[se.exerciseId]) {
        progressByExercise[se.exerciseId] = { name: se.exercise.name, data: [] };
      }
      const volume = se.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
      progressByExercise[se.exerciseId].data.push({
        date: session.date,
        volume,
        maxWeight: se.sets.length > 0 ? Math.max(...se.sets.map(s => s.weight)) : 0
      });
    });
  });

  return Object.values(progressByExercise);
}
async deleteWorkout(workoutId: string, userId: string) {
  const workout = await prisma.workout.findFirst({ where: { id: workoutId, userId } });
  if (!workout) throw new Error('Workout not found');
  // Supprimer toutes les sessions associées d'abord (si la relation ne cascade pas)
  await prisma.workoutSession.deleteMany({ where: { workoutId } });
  await prisma.workout.delete({ where: { id: workoutId } });
  return { message: 'Workout deleted' };
}
}