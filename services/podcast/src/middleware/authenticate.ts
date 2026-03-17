import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
    userId?: string;
    userRole?: string;
}


export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;


    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }


    req.userId = userId;
    req.userRole = userRole;
    next();
};