import { create } from 'zustand'
import { api } from '../lib/api'

interface User { id: string; email: string; name: string; balance: number; role: string; language: string; is_banned?: number; can_purchase?: number }
interface AuthState { user: User | null; loading: boolean; banned: { status: boolean; reason?: string }; login: (email: string, password: string) => Promise<void>; register: (email: string, name: string, password: string) => Promise<void>; logout: () => Promise<void>; checkAuth: () => Promise<void>; updateBalance: (balance: number) => void; setBanned: (status: boolean, reason?: string) => void }

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  banned: { status: false },
  login: async (email, password) => { const { user } = await api.post<{ user: User }>('/auth/login', { email, password }); set({ user }) },
  register: async (email, name, password) => { const { user } = await api.post<{ user: User }>('/auth/register', { email, name, password }); set({ user }) },
  logout: async () => { await api.post('/auth/logout'); set({ user: null, banned: { status: false } }) },
  checkAuth: async () => { try { const { user } = await api.get<{ user: User }>('/auth/me'); set({ user, loading: false }) } catch { set({ user: null, loading: false }) } },
  updateBalance: (balance) => set(s => s.user ? { user: { ...s.user, balance } } : {}),
  setBanned: (status, reason) => set({ banned: { status, reason }, user: null })
}))
