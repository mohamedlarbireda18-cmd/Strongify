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

// Seed public exercises
router.post('/seed', authenticate, async (req, res) => {
  try {
    const exercises = req.body.exercises;
    if (!exercises || !Array.isArray(exercises)) {
      return res.status(400).json({ error: 'Exercises array required' });
    }

    let count = 0;
    for (const ex of exercises) {
      await prisma.exercise.create({
        data: {
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          type: ex.type || 'BILATERAL'
        }
      });
      count++;
    }

    res.json({ message: `${count} exercises seeded`, count });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;