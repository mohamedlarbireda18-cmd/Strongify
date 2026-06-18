import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { WorkoutController } from '../controllers/workout.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const ctrl = new WorkoutController();
const prisma = new PrismaClient();

router.get('/', authenticate, (req, res) => ctrl.getUserWorkouts(req, res));
router.get('/:id', authenticate, (req, res) => ctrl.getWorkoutById(req, res));
router.post('/', authenticate, (req, res) => ctrl.createWorkout(req, res));
router.post('/:id/session', authenticate, (req, res) => ctrl.addSession(req, res));
router.get('/:id/progress', authenticate, (req, res) => ctrl.getWorkoutProgress(req, res));
router.delete('/:id', authenticate, (req, res) => ctrl.deleteWorkout(req, res));

// Modifier une session existante
router.put('/session/:sessionId', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { sessionId } = req.params as { sessionId: string };
    const { exercises } = req.body;

    const session = await prisma.workoutSession.findFirst({
      where: { id: sessionId, userId }
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    let totalVolume = 0;
    exercises.forEach((ex: any) => {
      ex.sets.forEach((set: any) => {
        totalVolume += set.weight * set.reps;
      });
    });

    await prisma.sessionSet.deleteMany({
      where: { sessionExercise: { sessionId } }
    });
    await prisma.workoutSessionExercise.deleteMany({
      where: { sessionId }
    });

    const updated = await prisma.workoutSession.update({
      where: { id: sessionId },
      data: {
        totalVolume,
        exercises: {
          create: exercises.map((ex: any, idx: number) => ({
            exerciseId: ex.exerciseId,
            order: idx + 1,
            notes: ex.notes || '',
            sets: {
              create: ex.sets.map((set: any, i: number) => ({
                setNumber: i + 1,
                weight: set.weight,
                reps: set.reps,
                isDropSet: set.isDropSet || false,
                isMicroReps: set.isMicroReps || false,
                notes: set.notes || ''
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

    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;