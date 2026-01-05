import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { depositRepo } from '../../database/repositories/deposit.repo.js';
import { notificationRepo } from '../../database/repositories/notification.repo.js';
import { userRepo } from '../../database/repositories/user.repo.js';
const router = Router();
router.get('/balance', authMiddleware, (req, res) => {
    const user = userRepo.findById(req.user.id);
    res.json({ balance: user?.balance || 0 });
});
router.get('/deposits', authMiddleware, (req, res) => {
    res.json(depositRepo.findByUser(req.user.id));
});
router.post('/deposit', authMiddleware, (req, res) => {
    const { amount, transactionId } = req.body;
    if (!amount || !transactionId)
        return res.status(400).json({ error: 'Amount and transaction ID required' });
    const deposit = depositRepo.create({ user_id: req.user.id, amount, transaction_id: transactionId });
    notificationRepo.create({ user_id: req.user.id, type: 'deposit', title: 'Deposit Pending', message: `Your deposit of $${amount} is pending approval.` });
    res.json(deposit);
});
export default router;
