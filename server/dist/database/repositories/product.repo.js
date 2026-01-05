import { db } from '../index.js';
import { v4 as uuid } from 'uuid';
export const productRepo = {
    create: (data) => {
        const id = uuid();
        db.prepare('INSERT INTO products (id, name, uc_amount, price, image) VALUES (?, ?, ?, ?, ?)').run(id, data.name, data.uc_amount, data.price, data.image || null);
        return productRepo.findById(id);
    },
    findById: (id) => db.prepare('SELECT * FROM products WHERE id = ?').get(id),
    findAll: () => db.prepare('SELECT * FROM products WHERE is_active = 1').all(),
    findAllAdmin: () => db.prepare('SELECT * FROM products').all(),
    update: (id, data) => {
        const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
        db.prepare(`UPDATE products SET ${fields} WHERE id = ?`).run(...Object.values(data), id);
    },
    delete: (id) => db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(id),
    hardDelete: (id) => {
        db.prepare('DELETE FROM codes WHERE product_id = ?').run(id);
        db.prepare('DELETE FROM products WHERE id = ?').run(id);
    },
    getAvailableCount: (productId) => db.prepare('SELECT COUNT(*) as count FROM codes WHERE product_id = ? AND is_used = 0').get(productId).count
};
