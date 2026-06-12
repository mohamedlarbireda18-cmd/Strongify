import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
const service = new DashboardService();

export class DashboardController {
  async getStats(req: Request, res: Response) {
    try {
        const userId = (req as any).userId;
        const period = req.query.period as string | undefined;
        res.json(await service.getStats(userId, period));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
}
  async getProgress(req: Request, res: Response) {
    try {
      const sessions = parseInt(req.query.sessions as string) || 7;
      res.json(await service.getOverallProgress((req as any).userId, sessions));
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  }
}