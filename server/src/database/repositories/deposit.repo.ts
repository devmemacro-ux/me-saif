import { db } from '../index.js'
import { v4 as uuid } from 'uuid'

export interface Deposit { id: string; user_id: string; amount: number; transaction_id: string; status: string; created_at: string }

export const depositRepo = {
  create: (data: { user_id: string; amount: number; transaction_id: string }) => {
    const id = uuid()
    db.prepare('INSERT INTO deposits (id, user_id, amount, transaction_id) VALUES (?, ?, ?, ?)').run(id, data.user_id, data.amount, data.transaction_id)
    return depositRepo.findById(id)!
  },
  findById: (id: string) => db.prepare('SELECT * FROM deposits WHERE id = ?').get(id) as Deposit | undefined,
  findByUser: (userId: string) => db.prepare('SELECT * FROM deposits WHERE user_id = ? ORDER BY created_at DESC').all(userId) as Deposit[],
  findAll: () => db.prepare('SELECT d.*, u.name as user_name, u.email FROM deposits d JOIN users u ON d.user_id = u.id ORDER BY d.created_at DESC').all(),
  findPending: () => db.prepare('SELECT d.*, u.name as user_name, u.email FROM deposits d JOIN users u ON d.user_id = u.id WHERE d.status = ? ORDER BY d.created_at DESC').all('pending') as Deposit[],
  updateStatus: (id: string, status: string) => db.prepare('UPDATE deposits SET status = ? WHERE id = ?').run(status, id)
}
