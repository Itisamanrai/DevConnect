import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "devconnect-super-secret-key";

// EXTEND REQ TO INCLUDE USER
export interface AuthRequest extends Request {
    user?: { id: string };
}

const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    const token = req.headers.authorization?.split(' ')[1];

    if(!token){
        res.status(401).json({ message: 'No token unauthorized'});
        return;
    }

    try{
        const decoded = jwt.verify(
            token,
            jwtSecret
        ) as  { id: string};

        req.user = { id: decoded.id }; // After successful verification, it stores the decoded user ID in req.user.
        next();
    } catch (error) {
        res.status(401).json({ message: " Invalid token "});
    }
};

export default authMiddleware;
