import { Router } from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { productRepo } from '../../database/repositories/product.repo.js';
import { codeRepo } from '../../database/repositories/code.repo.js';
import { orderRepo } from '../../database/repositories/order.repo.js';
import { userRepo } from '../../database/repositories/user.repo.js';
import { notificationRepo } from '../../database/repositories/notification.repo.js';
import { db } from '../../database/index.js';
const router = Router();
router.get('/', (_, res) => {
    const products = productRepo.findAll().map(p => ({ ...p, available: productRepo.getAvailableCount(p.id) }));
    res.json(products);
});
router.post('/purchase', authMiddleware, (req, res) => {
    const { productId, playerId } = req.body;
    const user = userRepo.findById(req.user.id);
    const product = productRepo.findById(productId);
    if (!product || !product.is_active)
        return res.status(404).json({ error: 'Product not found' });
    if (!user || user.balance < product.price)
        return res.status(400).json({ error: 'Insufficient balance' });
    const code = codeRepo.getAvailable(productId);
    if (!code)
        return res.status(400).json({ error: 'No codes available' });
    const tx = db.transaction(() => {
        userRepo.updateBalance(user.id, -product.price);
        const order = orderRepo.create({ user_id: user.id, product_id: productId, code_id: code.id, player_id: playerId, amount: product.price });
        codeRepo.markUsed(code.id, order.id);
        notificationRepo.create({ user_id: user.id, type: 'order', title: 'Order Completed', message: `Your order for ${product.name} has been completed. Code: ${code.code}` });
        return { order, code: code.code };
    });
    const result = tx();
    res.json(result);
});
export default router;
