import { db } from '../index.js';
import { v4 as uuid } from 'uuid';
export const userRepo = {
    create: (data) => {
        const id = uuid();
        db.prepare('INSERT INTO users (id, email, name, password) VALUES (?, ?, ?, ?)').run(id, data.email, data.name, data.password);
        return userRepo.findById(id);
    },
    findById: (id) => db.prepare('SELECT * FROM users WHERE id = ?').get(id),
    findByEmail: (email) => db.prepare('SELECT * FROM users WHERE email = ?').get(email),
    updateBalance: (id, amount) => db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(amount, id),
    setBalance: (id, balance) => db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(balance, id),
    updateLanguage: (id, language) => db.prepare('UPDATE users SET language = ? WHERE id = ?').run(language, id),
    updatePassword: (id, password) => db.prepare('UPDATE users SET password = ? WHERE id = ?').run(password, id),
    findAll: () => db.prepare('SELECT id, email, name, balance, role, language, created_at FROM users').all()
};
