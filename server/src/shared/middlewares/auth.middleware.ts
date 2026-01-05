import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../../config/index.js'
import { userRepo } from '../../database/repositories/user.repo.js'

export interface AuthRequest extends Request { user?: { id: string; role: string } }

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies[config.cookieName]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; role: string }
    const user = userRepo.findById(decoded.id)
    if (!user) return res.status(401).json({ error: 'User not found' })
    if (user.is_banned) return res.status(403).json({ error: 'Account suspended', banned: true, reason: user.ban_reason })
    req.user = decoded
    next()
  } catch { res.status(401).json({ error: 'Invalid token' }) }
}

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' })
  next()
}

export const purchaseMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = userRepo.findById(req.user!.id)
  if (!user?.can_purchase) return res.status(403).json({ error: 'Purchases disabled for your account' })
  next()
}
