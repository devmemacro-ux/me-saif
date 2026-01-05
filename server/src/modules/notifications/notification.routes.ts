import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../../shared/middlewares/auth.middleware.js'
import { notificationRepo } from '../../database/repositories/notification.repo.js'

const router = Router()

router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({ notifications: notificationRepo.findByUser(req.user!.id), unread: notificationRepo.getUnreadCount(req.user!.id) })
})

router.put('/:id/read', authMiddleware, (req: AuthRequest, res: Response) => {
  notificationRepo.markRead(req.params.id)
  res.json({ success: true })
})

router.put('/read-all', authMiddleware, (req: AuthRequest, res: Response) => {
  notificationRepo.markAllRead(req.user!.id)
  res.json({ success: true })
})

export default router
