import { db } from '../index.js';
import { v4 as uuid } from 'uuid';
export const notificationRepo = {
    create: (data) => {
        const id = uuid();
        db.prepare('INSERT INTO notifications (id, user_id, type, title, message) VALUES (?, ?, ?, ?, ?)').run(id, data.user_id, data.type, data.title, data.message);
        return id;
    },
    findByUser: (userId) => db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(userId),
    getUnreadCount: (userId) => db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(userId).count,
    markRead: (id) => db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id),
    markAllRead: (userId) => db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId)
};
