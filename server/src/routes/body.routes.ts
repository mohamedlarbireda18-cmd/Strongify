import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { BodyController } from '../controllers/body.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const ctrl = new BodyController();
const prisma = new PrismaClient();

// Routes existantes
router.post('/logs', authenticate, (req, res) => ctrl.addWeightLog(req, res));
router.get('/logs', authenticate, (req, res) => ctrl.getWeightLogs(req, res));
router.get('/calculate', authenticate, (req, res) => ctrl.calculateBMR(req, res));

// Modifier un log de poids
router.put('/logs/:id', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;
    const { weight } = req.body;

    const log = await prisma.weightLog.findFirst({ where: { id, userId } });
    if (!log) return res.status(404).json({ error: 'Log not found' });

    const updated = await prisma.weightLog.update({
      where: { id },
      data: { weight }
    });
    res.json(updated);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

// Supprimer un log de poids
router.delete('/logs/:id', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const log = await prisma.weightLog.findFirst({ where: { id, userId } });
    if (!log) return res.status(404).json({ error: 'Log not found' });

    await prisma.weightLog.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

// Ajouter des calories
router.post('/calories', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { calories } = req.body;
    const log = await prisma.calorieLog.create({ data: { userId, calories } });
    res.status(201).json(log);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

// Calories du jour
router.get('/calories/today', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const logs = await prisma.calorieLog.findMany({
      where: { userId, date: { gte: today } }
    });
    res.json(logs);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Sauvegarder les objectifs
router.put('/goals', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { goal, activity, height, age, gender, targetWeight } = req.body;
    const goals = await prisma.userGoals.upsert({
      where: { userId },
      update: { goal, activity, height, age, gender, targetWeight },
      create: { userId, goal: goal || 'MAINTAIN', activity: activity || 'MODERATE', height, age, gender, targetWeight }
    });
    res.json(goals);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

// Récupérer les objectifs
router.get('/goals', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const goals = await prisma.userGoals.findUnique({ where: { userId } });
    res.json(goals);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Réinitialiser les objectifs (garde les logs de poids)
router.delete('/goals', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    await prisma.userGoals.deleteMany({ where: { userId } });
    res.json({ message: 'Goals reset' });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

export default router;