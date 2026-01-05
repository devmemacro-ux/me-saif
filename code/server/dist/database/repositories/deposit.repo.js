import { db } from '../index.js';
import { v4 as uuid } from 'uuid';
export const depositRepo = {
    create: (data) => {
        const id = uuid();
        db.prepare('INSERT INTO deposits (id, user_id, amount, transaction_id) VALUES (?, ?, ?, ?)').run(id, data.user_id, data.amount, data.transaction_id);
        return depositRepo.findById(id);
    },
    findById: (id) => db.prepare('SELECT * FROM deposits WHERE id = ?').get(id),
    findByUser: (userId) => db.prepare('SELECT * FROM deposits WHERE user_id = ? ORDER BY created_at DESC').all(userId),
    findAll: () => db.prepare('SELECT d.*, u.name as user_name, u.email FROM deposits d JOIN users u ON d.user_id = u.id ORDER BY d.created_at DESC').all(),
    findPending: () => db.prepare('SELECT d.*, u.name as user_name, u.email FROM deposits d JOIN users u ON d.user_id = u.id WHERE d.status = ? ORDER BY d.created_at DESC').all('pending'),
    updateStatus: (id, status) => db.prepare('UPDATE deposits SET status = ? WHERE id = ?').run(status, id)
};
