import { Request, Response } from 'express';
import { ExerciseService } from '../services/exercise.service';
const service = new ExerciseService();

export class ExerciseController {
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      res.json(await service.getAll(userId));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  }
async createCustom(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { name, muscleGroup, type, imageUrl } = req.body;
    if (!name || !muscleGroup) return res.status(400).json({ error: 'Name and muscle group required.' });
    res.status(201).json(await service.createCustom(userId, { name, muscleGroup, type, imageUrl }));
  } catch (e: any) { res.status(400).json({ error: e.message }); }
}
  async deleteCustom(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      res.json(await service.deleteCustom(req.params.id as string, userId));
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  }
  async updateCustom(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { name, muscleGroup, type, imageUrl } = req.body;
    const exercise = await service.updateCustom(id as string, userId, { name, muscleGroup, type, imageUrl });
    res.json(exercise);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
}
}