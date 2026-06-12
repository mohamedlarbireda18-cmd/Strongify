import { Request, Response } from 'express';
import { WorkoutService } from '../services/workout.service';
const service = new WorkoutService();

export class WorkoutController {
  async getUserWorkouts(req: Request, res: Response) {
    try { res.json(await service.getUserWorkouts((req as any).userId)); } catch (e: any) { res.status(500).json({ error: e.message }); }
  }
  async getWorkoutById(req: Request, res: Response) {
    try { res.json(await service.getWorkoutById(req.params.id as string, (req as any).userId)); } catch (e: any) { res.status(404).json({ error: e.message }); }
  }
  async createWorkout(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { name, type, exercises } = req.body;
      if (!name || !exercises || !exercises.length) return res.status(400).json({ error: 'Name and exercises required.' });
      res.status(201).json(await service.createWorkout(userId, { name, type, exercises }));
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  }
  async addSession(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { exercises } = req.body;
      if (!exercises || !exercises.length) return res.status(400).json({ error: 'Exercises required.' });
      res.status(201).json(await service.addSession(req.params.id as string, userId, { exercises }));
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  }
  async getWorkoutProgress(req: Request, res: Response) {
    try {
      const sessions = parseInt(req.query.sessions as string) || 7;
      res.json(await service.getWorkoutProgress(req.params.id as string, (req as any).userId, sessions));
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  }
async deleteWorkout(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const result = await service.deleteWorkout(req.params.id as string, userId);
    res.json(result);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
}
}