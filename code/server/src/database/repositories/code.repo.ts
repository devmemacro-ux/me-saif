import { db } from '../index.js'
import { v4 as uuid } from 'uuid'

export interface Code { id: string; product_id: string; code: string; is_used: number; order_id: string | null; created_at: string }

export const codeRepo = {
  create: (productId: string, code: string) => {
    const id = uuid()
    db.prepare('INSERT INTO codes (id, product_id, code) VALUES (?, ?, ?)').run(id, productId, code)
    return id
  },
  createBulk: (productId: string, codes: string[]) => {
    const stmt = db.prepare('INSERT INTO codes (id, product_id, code) VALUES (?, ?, ?)')
    const tx = db.transaction(() => codes.forEach(code => stmt.run(uuid(), productId, code)))
    tx()
  },
  getAvailable: (productId: string) => db.prepare('SELECT * FROM codes WHERE product_id = ? AND is_used = 0 LIMIT 1').get(productId) as Code | undefined,
  markUsed: (id: string, orderId: string) => db.prepare('UPDATE codes SET is_used = 1, order_id = ? WHERE id = ?').run(orderId, id),
  findByProduct: (productId: string) => db.prepare('SELECT * FROM codes WHERE product_id = ?').all(productId) as Code[],
  findById: (id: string) => db.prepare('SELECT * FROM codes WHERE id = ?').get(id) as Code | undefined
}
