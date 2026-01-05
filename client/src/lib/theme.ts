import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Theme {
  name: string
  colors: {
    bg: { primary: string; secondary: string; tertiary: string }
    text: { primary: string; secondary: string; muted: string }
    accent: { primary: string; hover: string; glow: string }
    border: { primary: string; secondary: string }
    status: { success: string; error: string; warning: string }
  }
  effects: { glow: boolean; glassmorphism: boolean; gradients: boolean }
}

export const themes: Record<string, Theme> = {
  neon: {
    name: 'Neon Gaming',
    colors: {
      bg: { primary: '#0a0a0f', secondary: '#12121a', tertiary: '#1a1a25' },
      text: { primary: '#ffffff', secondary: '#a0a0b0', muted: '#606070' },
      accent: { primary: '#00f0ff', hover: '#00d4e0', glow: 'rgba(0,240,255,0.3)' },
      border: { primary: '#2a2a3a', secondary: '#1a1a25' },
      status: { success: '#00ff88', error: '#ff4466', warning: '#ffaa00' }
    },
    effects: { glow: true, glassmorphism: true, gradients: true }
  },
  purple: {
    name: 'Purple Haze',
    colors: {
      bg: { primary: '#0d0a14', secondary: '#151020', tertiary: '#1d1528' },
      text: { primary: '#f0e8ff', secondary: '#a090c0', muted: '#605080' },
      accent: { primary: '#a855f7', hover: '#9333ea', glow: 'rgba(168,85,247,0.3)' },
      border: { primary: '#2d2040', secondary: '#1d1528' },
      status: { success: '#22c55e', error: '#ef4444', warning: '#f59e0b' }
    },
    effects: { glow: true, glassmorphism: true, gradients: true }
  },
  emerald: {
    name: 'Emerald',
    colors: {
      bg: { primary: '#0a0f0d', secondary: '#101a15', tertiary: '#15251d' },
      text: { primary: '#e8fff0', secondary: '#90c0a0', muted: '#508060' },
      accent: { primary: '#10b981', hover: '#059669', glow: 'rgba(16,185,129,0.3)' },
      border: { primary: '#203d30', secondary: '#15251d' },
      status: { success: '#22c55e', error: '#ef4444', warning: '#f59e0b' }
    },
    effects: { glow: true, glassmorphism: true, gradients: true }
  },
  sunset: {
    name: 'Sunset',
    colors: {
      bg: { primary: '#0f0a0a', secondary: '#1a1212', tertiary: '#251a1a' },
      text: { primary: '#fff0e8', secondary: '#c0a090', muted: '#806050' },
      accent: { primary: '#f97316', hover: '#ea580c', glow: 'rgba(249,115,22,0.3)' },
      border: { primary: '#402d20', secondary: '#251a1a' },
      status: { success: '#22c55e', error: '#ef4444', warning: '#f59e0b' }
    },
    effects: { glow: true, glassmorphism: true, gradients: true }
  }
}

// Helper to add custom themes at runtime
export const addTheme = (key: string, theme: Theme) => { themes[key] = theme }

interface ThemeStore {
  current: string
  setTheme: (name: string) => void
  theme: Theme
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set, get) => ({
      current: 'neon',
      theme: themes.neon,
      setTheme: (name) => set({ current: name, theme: themes[name] || themes.neon })
    }),
    { name: 'theme-storage' }
  )
)
