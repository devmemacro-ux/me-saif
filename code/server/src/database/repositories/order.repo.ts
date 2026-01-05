import { db } from '../index.js'
import { v4 as uuid } from 'uuid'

export interface Order { id: string; user_id: string; product_id: string; code_id: string | null; player_id: string; amount: number; status: string; created_at: string }

export const orderRepo = {
  create: (data: { user_id: string; product_id: string; code_id: string; player_id: string; amount: number }) => {
    const id = uuid()
    db.prepare('INSERT INTO orders (id, user_id, product_id, code_id, player_id, amount) VALUES (?, ?, ?, ?, ?, ?)').run(id, data.user_id, data.product_id, data.code_id, data.player_id, data.amount)
    return orderRepo.findById(id)!
  },
  findById: (id: string) => db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Order | undefined,
  findByUser: (userId: string) => db.prepare('SELECT o.*, p.name as product_name, p.uc_amount, c.code FROM orders o JOIN products p ON o.product_id = p.id LEFT JOIN codes c ON o.code_id = c.id WHERE o.user_id = ? ORDER BY o.created_at DESC').all(userId),
  findAll: () => db.prepare('SELECT o.*, u.name as user_name, u.email, p.name as product_name FROM orders o JOIN users u ON o.user_id = u.id JOIN products p ON o.product_id = p.id ORDER BY o.created_at DESC').all()
}
