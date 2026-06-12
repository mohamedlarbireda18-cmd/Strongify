import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ExerciseController } from '../controllers/exercise.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const ctrl = new ExerciseController();

router.get('/', authenticate, (req, res) => ctrl.getAll(req, res));
router.post('/', authenticate, (req, res) => ctrl.createCustom(req, res));
router.put('/:id', authenticate, (req, res) => ctrl.updateCustom(req, res));
router.delete('/:id', authenticate, (req, res) => ctrl.deleteCustom(req, res));

// Seed public exercises with auto-generated SVG images
router.post('/seed', authenticate, async (req, res) => {
  try {
    const muscleColors: Record<string, string> = {
      Chest: '#ef4444', Back: '#3b82f6', Shoulders: '#f59e0b',
      Biceps: '#22c55e', Triceps: '#8b5cf6', Quadriceps: '#ec4899',
      Hamstrings: '#14b8a6', Glutes: '#f97316', Calves: '#6366f1',
      Abs: '#84cc16', Forearms: '#d946ef',
    };

    const muscleIcons: Record<string, string> = {
      Chest: '🏋️', Back: '🚣', Shoulders: '🙆', Biceps: '💪',
      Triceps: '🦾', Quadriceps: '🦵', Hamstrings: '🦿', Glutes: '🍑',
      Calves: '🦶', Abs: '🧎', Forearms: '🤙',
    };

    function generateImage(name: string, muscle: string): string {
      const color = muscleColors[muscle] || '#7c3aed';
      const icon = muscleIcons[muscle] || '🏋️';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" rx="20" fill="${color}" opacity="0.15"/>
  <rect width="400" height="400" rx="20" fill="none" stroke="${color}" stroke-width="2" opacity="0.3"/>
  <text x="200" y="180" text-anchor="middle" font-size="80">${icon}</text>
  <text x="200" y="240" text-anchor="middle" font-size="16" font-family="Inter, sans-serif" fill="${color}" font-weight="600">${name}</text>
  <text x="200" y="265" text-anchor="middle" font-size="12" font-family="Inter, sans-serif" fill="${color}" opacity="0.6">${muscle}</text>
</svg>`;
      return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    }

    const exercises = req.body.exercises;
    if (!exercises || !Array.isArray(exercises)) {
      return res.status(400).json({ error: 'Exercises array required' });
    }

    // Supprimer les données dépendantes avant de supprimer les exercices
    await prisma.sessionSet.deleteMany();
    await prisma.workoutSessionExercise.deleteMany();
    await prisma.workoutSession.deleteMany();
    await prisma.exerciseSet.deleteMany();
    await prisma.workoutExercise.deleteMany();
    await prisma.programItem.deleteMany();
    await prisma.exerciseRecord.deleteMany();
    await prisma.exercise.deleteMany();

    let count = 0;
    for (const ex of exercises) {
      const imageUrl = generateImage(ex.name, ex.muscleGroup);
      await prisma.exercise.create({
        data: {
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          type: ex.type || 'BILATERAL',
          imageUrl
        }
      });
      count++;
    }

    res.json({ message: `${count} exercises seeded with images`, count });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;