import { db } from '../index.js'
import { v4 as uuid } from 'uuid'

export interface User { id: string; email: string; name: string; password: string; balance: number; role: string; language: string; is_banned: number; can_purchase: number; ban_reason: string | null; created_at: string }

export const userRepo = {
  create: (data: { email: string; name: string; password: string }) => {
    const id = uuid()
    db.prepare('INSERT INTO users (id, email, name, password) VALUES (?, ?, ?, ?)').run(id, data.email, data.name, data.password)
    return userRepo.findById(id)!
  },
  findById: (id: string) => db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined,
  findByEmail: (email: string) => db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined,
  updateBalance: (id: string, amount: number) => db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(amount, id),
  setBalance: (id: string, balance: number) => db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(balance, id),
  updateLanguage: (id: string, language: string) => db.prepare('UPDATE users SET language = ? WHERE id = ?').run(language, id),
  updatePassword: (id: string, password: string) => db.prepare('UPDATE users SET password = ? WHERE id = ?').run(password, id),
  setBanned: (id: string, banned: boolean, reason?: string) => db.prepare('UPDATE users SET is_banned = ?, ban_reason = ? WHERE id = ?').run(banned ? 1 : 0, reason || null, id),
  setCanPurchase: (id: string, canPurchase: boolean) => db.prepare('UPDATE users SET can_purchase = ? WHERE id = ?').run(canPurchase ? 1 : 0, id),
  findAll: () => db.prepare('SELECT id, email, name, balance, role, language, is_banned, can_purchase, ban_reason, created_at FROM users').all() as Omit<User, 'password'>[]
}
