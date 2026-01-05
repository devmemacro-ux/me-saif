import { db, initDB } from '../index.js'
import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'

async function seed() {
  initDB()
  
  // Create admin user
  const adminId = uuid()
  const adminPass = await bcrypt.hash('admin123', 10)
  db.prepare('INSERT OR IGNORE INTO users (id, email, name, password, role, balance) VALUES (?, ?, ?, ?, ?, ?)').run(adminId, 'admin@fayez.store', 'Admin', adminPass, 'admin', 1000)
  
  // Create test user
  const userId = uuid()
  const userPass = await bcrypt.hash('user123', 10)
  db.prepare('INSERT OR IGNORE INTO users (id, email, name, password, balance) VALUES (?, ?, ?, ?, ?)').run(userId, 'user@test.com', 'Test User', userPass, 50)
  
  // Create products
  const products = [
    { name: '60 UC', uc_amount: 60, price: 0.99 },
    { name: '325 UC', uc_amount: 325, price: 4.99 },
    { name: '660 UC', uc_amount: 660, price: 9.99 },
    { name: '1800 UC', uc_amount: 1800, price: 24.99 },
    { name: '3850 UC', uc_amount: 3850, price: 49.99 },
    { name: '8100 UC', uc_amount: 8100, price: 99.99 }
  ]
  
  for (const p of products) {
    const pid = uuid()
    db.prepare('INSERT OR IGNORE INTO products (id, name, uc_amount, price) VALUES (?, ?, ?, ?)').run(pid, p.name, p.uc_amount, p.price)
    // Add sample codes
    for (let i = 1; i <= 5; i++) {
      db.prepare('INSERT INTO codes (id, product_id, code) VALUES (?, ?, ?)').run(uuid(), pid, `${p.name.replace(' ', '')}-CODE-${Date.now()}-${i}`)
    }
  }
  
  console.log('Seed completed!')
  console.log('Admin: admin@fayez.store / admin123')
  console.log('User: user@test.com / user123')
}

seed()
