import { db } from '../index.js';
import { v4 as uuid } from 'uuid';
export const codeRepo = {
    create: (productId, code) => {
        const id = uuid();
        db.prepare('INSERT INTO codes (id, product_id, code) VALUES (?, ?, ?)').run(id, productId, code);
        return id;
    },
    createBulk: (productId, codes) => {
        const stmt = db.prepare('INSERT INTO codes (id, product_id, code) VALUES (?, ?, ?)');
        const tx = db.transaction(() => codes.forEach(code => stmt.run(uuid(), productId, code)));
        tx();
    },
    getAvailable: (productId) => db.prepare('SELECT * FROM codes WHERE product_id = ? AND is_used = 0 LIMIT 1').get(productId),
    markUsed: (id, orderId) => db.prepare('UPDATE codes SET is_used = 1, order_id = ? WHERE id = ?').run(orderId, id),
    findByProduct: (productId) => db.prepare('SELECT * FROM codes WHERE product_id = ?').all(productId),
    findById: (id) => db.prepare('SELECT * FROM codes WHERE id = ?').get(id)
};
