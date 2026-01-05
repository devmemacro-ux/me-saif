import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../../shared/middlewares/auth.middleware.js'
import { orderRepo } from '../../database/repositories/order.repo.js'

const router = Router()

router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json(orderRepo.findByUser(req.user!.id))
})

export default router
