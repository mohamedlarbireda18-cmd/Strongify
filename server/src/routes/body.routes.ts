import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { BodyController } from '../controllers/body.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const ctrl = new BodyController();
const prisma = new PrismaClient();

// ============================================
// WEIGHT LOGS
// ============================================

router.post('/logs', authenticate, (req, res) => ctrl.addWeightLog(req, res));
router.get('/logs', authenticate, (req, res) => ctrl.getWeightLogs(req, res));

router.put('/logs/:id', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;
    const { weight } = req.body;
    const log = await prisma.weightLog.findFirst({ where: { id, userId } });
    if (!log) return res.status(404).json({ error: 'Log not found' });
    const updated = await prisma.weightLog.update({ where: { id }, data: { weight } });
    res.json(updated);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

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

// ============================================
// BMR CALCULATOR
// ============================================

router.get('/calculate', authenticate, (req, res) => ctrl.calculateBMR(req, res));

// ============================================
// CALORIE LOGS
// ============================================

router.post('/calories', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { calories } = req.body;
    if (!calories || calories <= 0) return res.status(400).json({ error: 'Calories must be a positive number.' });
    const log = await prisma.calorieLog.create({ data: { userId, calories: parseInt(calories) } });
    res.status(201).json(log);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

router.get('/calories/today', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const logs = await prisma.calorieLog.findMany({
      where: { userId, date: { gte: today, lt: tomorrow } },
      orderBy: { date: 'desc' }
    });
    res.json(logs);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/calories', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const days = parseInt(req.query.days as string) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);
    const logs = await prisma.calorieLog.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: 'asc' }
    });
    res.json(logs);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ============================================
// USER GOALS
// ============================================

router.put('/goals', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { goal, activity, height, age, gender, targetWeight } = req.body;
    const goals = await prisma.userGoals.upsert({
      where: { userId },
      update: { goal: goal || 'MAINTAIN', activity: activity || 'MODERATE', height: height || null, age: age ? parseInt(age) : null, gender: gender || null, targetWeight: targetWeight ? parseFloat(targetWeight) : null },
      create: { userId, goal: goal || 'MAINTAIN', activity: activity || 'MODERATE', height: height || null, age: age ? parseInt(age) : null, gender: gender || null, targetWeight: targetWeight ? parseFloat(targetWeight) : null }
    });
    res.json(goals);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

router.get('/goals', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const goals = await prisma.userGoals.findUnique({ where: { userId } });
    res.json(goals);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.delete('/goals', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    await prisma.userGoals.deleteMany({ where: { userId } });
    res.json({ message: 'Goals reset. Weight logs and calorie history kept.' });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

export default router;