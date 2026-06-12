import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
      }
      
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters.' });
      }
      
      const result = await authService.register(name, email, password);
      res.status(201).json(result);
      
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async verifyEmail(req: Request, res: Response) {
    try {
      const { userId, code } = req.body;
      
      if (!userId || !code) {
        return res.status(400).json({ error: 'User ID and code are required.' });
      }
      
      const result = await authService.verifyEmail(userId, code);
      res.json(result);
      
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async resendCode(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
      }
      
      const result = await authService.resendCode(userId);
      res.json(result);
      
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }
      
      const result = await authService.login(email, password);
      res.json(result);
      
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
  async forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }
    
    const result = await authService.forgotPassword(email);
    res.json(result);
    
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

async verifyResetCode(req: Request, res: Response) {
  try {
    const { userId, code } = req.body;
    
    if (!userId || !code) {
      return res.status(400).json({ error: 'User ID and code are required.' });
    }
    
    const result = await authService.verifyResetCode(userId, code);
    res.json(result);
    
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

async resetPassword(req: Request, res: Response) {
  try {
    const { userId, code, newPassword } = req.body;
    
    if (!userId || !code || !newPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    
    const result = await authService.resetPassword(userId, code, newPassword);
    res.json(result);
    
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
}
