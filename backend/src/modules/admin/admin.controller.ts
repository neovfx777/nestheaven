import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';

export class AdminController {
  // Will be implemented in next step (user management)
  createUser = async (req: AuthRequest, res: Response): Promise<void> => {
    res.status(501).json({
      success: false,
      error: 'Not implemented yet - will be part of user management module'
    });
  };
}