import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { userRepo } from '../../database/repositories/user.repo.js';
import { productRepo } from '../../database/repositories/product.repo.js';
import { codeRepo } from '../../database/repositories/code.repo.js';
import { orderRepo } from '../../database/repositories/order.repo.js';
import { depositRepo } from '../../database/repositories/deposit.repo.js';
import { notificationRepo } from '../../database/repositories/notification.repo.js';
import { db } from '../../database/index.js';
const router = Router();
router.use(authMiddleware, adminMiddleware);
// Stats
router.get('/stats', (_, res) => {
    const users = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
    const orders = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
    const revenue = db.prepare('SELECT COALESCE(SUM(amount), 0) as t FROM orders').get().t;
    const pending = db.prepare('SELECT COUNT(*) as c FROM deposits WHERE status = ?').get('pending').c;
    res.json({ users, orders, revenue, pendingDeposits: pending });
});
// Users
router.get('/users', (_, res) => res.json(userRepo.findAll()));
router.put('/users/:id/balance', (req, res) => { userRepo.setBalance(req.params.id, req.body.balance); res.json({ success: true }); });
// Products
router.get('/products', (_, res) => res.json(productRepo.findAll().map(p => ({ ...p, available: productRepo.getAvailableCount(p.id), total: codeRepo.findByProduct(p.id).length }))));
router.post('/products', (req, res) => res.json(productRepo.create(req.body)));
router.put('/products/:id', (req, res) => { productRepo.update(req.params.id, req.body); res.json({ success: true }); });
router.delete('/products/:id', (req, res) => { productRepo.hardDelete(req.params.id); res.json({ success: true }); });
// Codes
router.get('/products/:id/codes', (req, res) => res.json(codeRepo.findByProduct(req.params.id)));
router.post('/products/:id/codes', (req, res) => { codeRepo.createBulk(req.params.id, req.body.codes); res.json({ success: true }); });
// Orders
router.get('/orders', (_, res) => res.json(orderRepo.findAll()));
// Deposits
router.get('/deposits', (_, res) => res.json(depositRepo.findAll()));
router.get('/deposits/pending', (_, res) => res.json(depositRepo.findPending()));
router.put('/deposits/:id/approve', (req, res) => {
    const deposit = depositRepo.findById(req.params.id);
    if (!deposit || deposit.status !== 'pending')
        return res.status(400).json({ error: 'Invalid deposit' });
    depositRepo.updateStatus(deposit.id, 'approved');
    userRepo.updateBalance(deposit.user_id, deposit.amount);
    notificationRepo.create({ user_id: deposit.user_id, type: 'deposit', title: 'Deposit Approved', message: `Your deposit of $${deposit.amount} has been approved.` });
    res.json({ success: true });
});
router.put('/deposits/:id/reject', (req, res) => {
    const deposit = depositRepo.findById(req.params.id);
    if (!deposit || deposit.status !== 'pending')
        return res.status(400).json({ error: 'Invalid deposit' });
    depositRepo.updateStatus(deposit.id, 'rejected');
    notificationRepo.create({ user_id: deposit.user_id, type: 'deposit', title: 'Deposit Rejected', message: `Your deposit of $${deposit.amount} has been rejected.` });
    res.json({ success: true });
});
export default router;
