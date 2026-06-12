import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
// DELETE /api/users/account
router.delete('/account', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    
    // Supprimer toutes les données liées
    await prisma.weightLog.deleteMany({ where: { userId } });
    await prisma.customExercise.deleteMany({ where: { userId } });
    await prisma.sessionSet.deleteMany({ where: { sessionExercise: { session: { userId } } } });
    await prisma.workoutSessionExercise.deleteMany({ where: { session: { userId } } });
    await prisma.workoutSession.deleteMany({ where: { userId } });
    await prisma.exerciseSet.deleteMany({ where: { workoutExercise: { workout: { userId } } } });
    await prisma.workoutExercise.deleteMany({ where: { workout: { userId } } });
    await prisma.workout.deleteMany({ where: { userId } });
    await prisma.exerciseRecord.deleteMany({ where: { userId } });
    await prisma.programItem.deleteMany({ where: { program: { userId } } });
    await prisma.program.deleteMany({ where: { userId } });
    
    // Supprimer l'utilisateur
    await prisma.user.delete({ where: { id: userId } });

    res.json({ message: 'Account deleted successfully' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});
// PUT /api/users/profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { name } = req.body;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name },
      select: { id: true, name: true, email: true, avatar: true }
    });
    res.json(user);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// PUT /api/users/password
router.put('/password', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed }
    });

    res.json({ message: 'Password updated' });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;