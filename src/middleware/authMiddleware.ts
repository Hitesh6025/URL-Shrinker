import "dotenv/config"
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET || 'Bytes';

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ message: 'Unauthorized: No token provided, please provide your JWT token in the header, login again to regenerate /auth/login' });
        return
    }

    const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
        res.status(401).json({ message: 'Unauthorized: Token not found in the header' });
        return
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            res.status(403).json({ message: 'Unauthorized: Invalid token, please re-login to create a new one' });
            return;
        }
        // Attach the decoded payload to the request
        req.user = decoded;
        next(); // Proceed to the next middleware or route handler
    });
};

export { authenticateJWT };
