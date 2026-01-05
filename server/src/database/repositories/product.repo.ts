import { db } from '../index.js'
import { v4 as uuid } from 'uuid'

export interface Product { id: string; name: string; uc_amount: number; price: number; image: string | null; is_active: number; created_at: string }

export const productRepo = {
  create: (data: { name: string; uc_amount: number; price: number; image?: string }) => {
    const id = uuid()
    db.prepare('INSERT INTO products (id, name, uc_amount, price, image) VALUES (?, ?, ?, ?, ?)').run(id, data.name, data.uc_amount, data.price, data.image || null)
    return productRepo.findById(id)!
  },
  findById: (id: string) => db.prepare('SELECT * FROM products WHERE id = ?').get(id) as Product | undefined,
  findAll: () => db.prepare('SELECT * FROM products WHERE is_active = 1').all() as Product[],
  findAllAdmin: () => db.prepare('SELECT * FROM products').all() as Product[],
  update: (id: string, data: Partial<Product>) => {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ')
    db.prepare(`UPDATE products SET ${fields} WHERE id = ?`).run(...Object.values(data), id)
  },
  delete: (id: string) => db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(id),
  hardDelete: (id: string) => {
    db.prepare('DELETE FROM codes WHERE product_id = ?').run(id)
    db.prepare('DELETE FROM products WHERE id = ?').run(id)
  },
  getAvailableCount: (productId: string) => (db.prepare('SELECT COUNT(*) as count FROM codes WHERE product_id = ? AND is_used = 0').get(productId) as { count: number }).count
}
