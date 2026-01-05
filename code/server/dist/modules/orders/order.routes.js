import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { orderRepo } from '../../database/repositories/order.repo.js';
const router = Router();
router.get('/', authMiddleware, (req, res) => {
    res.json(orderRepo.findByUser(req.user.id));
});
export default router;
