import { Router, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../../config/index.js'
import { userRepo } from '../../database/repositories/user.repo.js'
import { authMiddleware, AuthRequest } from '../../shared/middlewares/auth.middleware.js'

const router = Router()

const signToken = (id: string, role: string) => jwt.sign({ id, role }, config.jwtSecret, { expiresIn: '7d' } as jwt.SignOptions)

router.post('/register', async (req, res) => {
  const { email, name, password } = req.body
  if (!email || !name || !password) return res.status(400).json({ error: 'All fields required' })
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
  if (userRepo.findByEmail(email)) return res.status(400).json({ error: 'Email already exists' })
  const hash = await bcrypt.hash(password, 10)
  const user = userRepo.create({ email, name, password: hash })
  const token = signToken(user!.id, user!.role)
  res.cookie(config.cookieName, token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
  res.json({ user: { id: user!.id, email: user!.email, name: user!.name, balance: user!.balance, role: user!.role, language: user!.language } })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = userRepo.findByEmail(email)
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Invalid credentials' })
  const token = signToken(user.id, user.role)
  res.cookie(config.cookieName, token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
  res.json({ user: { id: user.id, email: user.email, name: user.name, balance: user.balance, role: user.role, language: user.language } })
})

router.post('/logout', (_, res) => { res.clearCookie(config.cookieName); res.json({ success: true }) })

router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = userRepo.findById(req.user!.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ user: { id: user.id, email: user.email, name: user.name, balance: user.balance, role: user.role, language: user.language } })
})

router.put('/password', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body
  const user = userRepo.findById(req.user!.id)
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) return res.status(400).json({ error: 'Current password incorrect' })
  userRepo.updatePassword(user.id, await bcrypt.hash(newPassword, 10))
  res.json({ success: true })
})

router.put('/language', authMiddleware, (req: AuthRequest, res: Response) => {
  userRepo.updateLanguage(req.user!.id, req.body.language)
  res.json({ success: true })
})

export default router
