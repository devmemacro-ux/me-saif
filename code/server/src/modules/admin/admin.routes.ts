import { Router, Response } from 'express'
import { authMiddleware, adminMiddleware, AuthRequest } from '../../shared/middlewares/auth.middleware.js'
import { userRepo } from '../../database/repositories/user.repo.js'
import { productRepo } from '../../database/repositories/product.repo.js'
import { codeRepo } from '../../database/repositories/code.repo.js'
import { orderRepo } from '../../database/repositories/order.repo.js'
import { depositRepo } from '../../database/repositories/deposit.repo.js'
import { notificationRepo } from '../../database/repositories/notification.repo.js'
import { settingsRepo } from '../../database/repositories/settings.repo.js'
import { encrypt, decrypt } from '../../shared/utils/crypto.js'
import { startAutoVerification, stopAutoVerification, isAutoVerificationRunning, testBinanceConnection } from '../../shared/services/binance.service.js'
import { db } from '../../database/index.js'

const router = Router()
router.use(authMiddleware, adminMiddleware)

// Stats
router.get('/stats', (_, res) => {
  const users = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c
  const orders = (db.prepare('SELECT COUNT(*) as c FROM orders').get() as { c: number }).c
  const revenue = (db.prepare('SELECT COALESCE(SUM(amount), 0) as t FROM orders').get() as { t: number }).t
  const pending = (db.prepare('SELECT COUNT(*) as c FROM deposits WHERE status = ?').get('pending') as { c: number }).c
  res.json({ users, orders, revenue, pendingDeposits: pending })
})

// Chart data - last 7 days
router.get('/stats/chart', (_, res) => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const dayName = date.toLocaleDateString('en', { weekday: 'short' })
    
    const ordersCount = (db.prepare(`SELECT COUNT(*) as c FROM orders WHERE DATE(created_at) = ?`).get(dateStr) as { c: number }).c
    const ordersRevenue = (db.prepare(`SELECT COALESCE(SUM(amount), 0) as t FROM orders WHERE DATE(created_at) = ?`).get(dateStr) as { t: number }).t
    const depositsCount = (db.prepare(`SELECT COUNT(*) as c FROM deposits WHERE DATE(created_at) = ? AND status = 'approved'`).get(dateStr) as { c: number }).c
    const usersCount = (db.prepare(`SELECT COUNT(*) as c FROM users WHERE DATE(created_at) = ?`).get(dateStr) as { c: number }).c
    
    days.push({ name: dayName, orders: ordersCount, revenue: ordersRevenue, deposits: depositsCount, users: usersCount })
  }
  res.json(days)
})

// Users
router.get('/users', (_, res) => res.json(userRepo.findAll()))
router.put('/users/:id/balance', (req, res) => { userRepo.setBalance(req.params.id, req.body.balance); res.json({ success: true }) })
router.put('/users/:id/ban', (req, res) => {
  const { banned, reason } = req.body
  userRepo.setBanned(req.params.id, banned, reason)
  if (banned) {
    notificationRepo.create({ user_id: req.params.id, type: 'system', title: 'Account Suspended', message: reason || 'Your account has been suspended. Contact support for more information.' })
  } else {
    notificationRepo.create({ user_id: req.params.id, type: 'system', title: 'Account Restored', message: 'Your account has been restored. You can now use all features.' })
  }
  res.json({ success: true })
})
router.put('/users/:id/purchase', (req, res) => {
  userRepo.setCanPurchase(req.params.id, req.body.canPurchase)
  notificationRepo.create({ 
    user_id: req.params.id, 
    type: 'system', 
    title: req.body.canPurchase ? 'Purchases Enabled' : 'Purchases Disabled', 
    message: req.body.canPurchase ? 'You can now make purchases again.' : 'Your ability to make purchases has been temporarily disabled.'
  })
  res.json({ success: true })
})
router.put('/users/:id/reset-balance', (req, res) => {
  const user = userRepo.findById(req.params.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  const oldBalance = user.balance
  userRepo.setBalance(req.params.id, 0)
  notificationRepo.create({ user_id: req.params.id, type: 'system', title: 'Balance Reset', message: `Your balance of $${oldBalance.toFixed(2)} has been reset to $0.00.` })
  res.json({ success: true })
})

// User Activity
router.get('/users/:id/activity', (req, res) => {
  const userId = req.params.id
  const user = userRepo.findById(userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  
  const orders = db.prepare(`
    SELECT o.*, p.name as product_name, p.uc_amount 
    FROM orders o 
    JOIN products p ON o.product_id = p.id 
    WHERE o.user_id = ? 
    ORDER BY o.created_at DESC
  `).all(userId)
  
  const deposits = db.prepare(`
    SELECT * FROM deposits WHERE user_id = ? ORDER BY created_at DESC
  `).all(userId)
  
  const notifications = db.prepare(`
    SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20
  `).all(userId)
  
  const stats = {
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum: number, o: any) => sum + o.amount, 0),
    totalDeposits: deposits.filter((d: any) => d.status === 'approved').reduce((sum: number, d: any) => sum + d.amount, 0),
    pendingDeposits: deposits.filter((d: any) => d.status === 'pending').length
  }
  
  res.json({ user, orders, deposits, notifications, stats })
})

// Products
router.get('/products', (_, res) => res.json(productRepo.findAll().map(p => ({ ...p, available: productRepo.getAvailableCount(p.id), total: codeRepo.findByProduct(p.id).length }))))
router.post('/products', (req, res) => res.json(productRepo.create(req.body)))
router.put('/products/:id', (req, res) => { productRepo.update(req.params.id, req.body); res.json({ success: true }) })
router.delete('/products/:id', (req, res) => { productRepo.hardDelete(req.params.id); res.json({ success: true }) })

// Codes
router.get('/products/:id/codes', (req, res) => res.json(codeRepo.findByProduct(req.params.id)))
router.post('/products/:id/codes', (req, res) => { codeRepo.createBulk(req.params.id, req.body.codes); res.json({ success: true }) })

// Orders
router.get('/orders', (_, res) => res.json(orderRepo.findAll()))

// Deposits
router.get('/deposits', (_, res) => res.json(depositRepo.findAll()))
router.get('/deposits/pending', (_, res) => res.json(depositRepo.findPending()))
router.put('/deposits/:id/approve', (req, res) => {
  const deposit = depositRepo.findById(req.params.id)
  if (!deposit || deposit.status !== 'pending') return res.status(400).json({ error: 'Invalid deposit' })
  depositRepo.updateStatus(deposit.id, 'approved')
  userRepo.updateBalance(deposit.user_id, deposit.amount)
  notificationRepo.create({ user_id: deposit.user_id, type: 'deposit', title: 'Deposit Approved', message: `Your deposit of $${deposit.amount} has been approved.` })
  res.json({ success: true })
})
router.put('/deposits/:id/reject', (req, res) => {
  const deposit = depositRepo.findById(req.params.id)
  if (!deposit || deposit.status !== 'pending') return res.status(400).json({ error: 'Invalid deposit' })
  depositRepo.updateStatus(deposit.id, 'rejected')
  notificationRepo.create({ user_id: deposit.user_id, type: 'deposit', title: 'Deposit Rejected', message: `Your deposit of $${deposit.amount} has been rejected.` })
  res.json({ success: true })
})

// Settings - Binance Auto Verification
router.get('/settings/binance', (_, res) => {
  const enabled = settingsRepo.get('binance_auto_verify') === 'true'
  const hasKeys = !!settingsRepo.get('binance_api_key')
  const connected = isAutoVerificationRunning()
  res.json({ enabled, hasKeys, connected })
})

router.post('/settings/binance', async (req, res) => {
  const { apiKey, apiSecret } = req.body
  if (!apiKey || !apiSecret) return res.status(400).json({ error: 'API Key and Secret required' })
  
  const valid = await testBinanceConnection(apiKey, apiSecret)
  if (!valid) return res.status(400).json({ error: 'Invalid API credentials' })
  
  settingsRepo.set('binance_api_key', encrypt(apiKey))
  settingsRepo.set('binance_api_secret', encrypt(apiSecret))
  settingsRepo.set('binance_auto_verify', 'true')
  startAutoVerification()
  
  res.json({ success: true, connected: true })
})

router.put('/settings/binance/toggle', (req, res) => {
  const { enabled } = req.body
  const hasKeys = !!settingsRepo.get('binance_api_key')
  
  if (enabled && !hasKeys) return res.status(400).json({ error: 'Configure API keys first' })
  
  settingsRepo.set('binance_auto_verify', enabled ? 'true' : 'false')
  if (enabled) startAutoVerification()
  else stopAutoVerification()
  
  res.json({ success: true, connected: enabled })
})

router.delete('/settings/binance', (_, res) => {
  stopAutoVerification()
  settingsRepo.delete('binance_api_key')
  settingsRepo.delete('binance_api_secret')
  settingsRepo.set('binance_auto_verify', 'false')
  res.json({ success: true })
})

export default router
