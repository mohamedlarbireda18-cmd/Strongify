import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class ExerciseService {
  async getAll(userId?: string) {
    const library = await prisma.exercise.findMany({ orderBy: { name: 'asc' } });
    let custom: any[] = [];
    if (userId) {
      custom = await prisma.customExercise.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    }
    return { library, custom };
  }

async createCustom(userId: string, data: { name: string; muscleGroup: string; type: string; imageUrl?: string }) {
  return prisma.customExercise.create({
    data: {
      userId,
      name: data.name,
      muscleGroup: data.muscleGroup,
      type: data.type || 'BILATERAL',
      imageUrl: data.imageUrl || null
    }
  });
}

  async deleteCustom(exerciseId: string, userId: string) {
    const exercise = await prisma.customExercise.findFirst({ where: { id: exerciseId, userId } });
    if (!exercise) throw new Error('Exercise not found or unauthorized.');
    await prisma.customExercise.delete({ where: { id: exerciseId } });
    return { message: 'Exercise deleted.' };
  }
  async updateCustom(exerciseId: string, userId: string, data: { name?: string; muscleGroup?: string; type?: string; imageUrl?: string }) {
  const exercise = await prisma.customExercise.findFirst({
    where: { id: exerciseId, userId }
  });

  if (!exercise) throw new Error('Exercise not found or unauthorized.');

  return prisma.customExercise.update({
    where: { id: exerciseId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.muscleGroup && { muscleGroup: data.muscleGroup }),
      ...(data.type && { type: data.type }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl })
    }
  });
}
}