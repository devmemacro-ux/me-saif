import { db } from '../index.js'
import { v4 as uuid } from 'uuid'

export interface Notification { id: string; user_id: string; type: string; title: string; message: string; is_read: number; created_at: string }

export const notificationRepo = {
  create: (data: { user_id: string; type: string; title: string; message: string }) => {
    const id = uuid()
    db.prepare('INSERT INTO notifications (id, user_id, type, title, message) VALUES (?, ?, ?, ?, ?)').run(id, data.user_id, data.type, data.title, data.message)
    return id
  },
  findByUser: (userId: string) => db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(userId) as Notification[],
  getUnreadCount: (userId: string) => (db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(userId) as { count: number }).count,
  markRead: (id: string) => db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id),
  markAllRead: (userId: string) => db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId)
}
