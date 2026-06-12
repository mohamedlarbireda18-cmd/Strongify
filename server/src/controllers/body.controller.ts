import { Request, Response } from 'express';
import { BodyService } from '../services/body.service';
const service = new BodyService();

export class BodyController {
  async addWeightLog(req: Request, res: Response) {
    try {
      const { weight } = req.body;
      if (!weight) return res.status(400).json({ error: 'Weight required.' });
      res.status(201).json(await service.addWeightLog((req as any).userId, weight));
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  }
  async getWeightLogs(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      res.json(await service.getWeightLogs((req as any).userId, days));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  }
  async calculateBMR(req: Request, res: Response) {
    try {
      const weight = req.query.weight as string;
      const height = req.query.height as string;
      const age = req.query.age as string;
      const gender = req.query.gender as string;
      
      if (!weight || !height || !age || !gender) return res.status(400).json({ error: 'Params required.' });
      
      const w = parseFloat(weight);
      const h = parseFloat(height);
      const a = parseInt(age);
      let bmr = gender === 'male' ? 10*w + 6.25*h - 5*a + 5 : 10*w + 6.25*h - 5*a - 161;
      
      res.json({ bmr: Math.round(bmr), maintenance: Math.round(bmr*1.55), cutting: Math.round(bmr*1.55-500), bulking: Math.round(bmr*1.55+300) });
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  }
}