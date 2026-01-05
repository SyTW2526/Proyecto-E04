import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { User, UserInterface } from '../items/user.js';

export interface AuthRequest extends Request {
    token: string;
    user: UserInterface & { _id: string }; 
}

interface IDecodedPayload extends JwtPayload {
    _id: string; 
}

const JWT_SECRET: string ='fallback-secret-for-dev-only-654321';

/**
 * Middleware para autenticar usuarios mediante un token JWT.
 */
export const auth = async (
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            throw new Error('No token');
        }

        const decoded = jwt.verify(token, JWT_SECRET) as IDecodedPayload;
        const user = await User.findById(decoded._id) as (UserInterface & { _id: string }) | null;

        if (!user) {
            throw new Error('No user');
        }

        (req as AuthRequest).user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Por favor, autentíquese.' });
    }
};