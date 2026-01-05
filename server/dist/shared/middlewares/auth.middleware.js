import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
export const authMiddleware = (req, res, next) => {
    const token = req.cookies[config.cookieName];
    if (!token)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};
export const adminMiddleware = (req, res, next) => {
    if (req.user?.role !== 'admin')
        return res.status(403).json({ error: 'Admin access required' });
    next();
};
