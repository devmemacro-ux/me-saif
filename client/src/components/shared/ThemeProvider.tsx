import { useEffect } from 'react'
import { useTheme } from '../../lib/theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()

  useEffect(() => {
    const root = document.documentElement
    const { colors } = theme
    root.style.setProperty('--bg-primary', colors.bg.primary)
    root.style.setProperty('--bg-secondary', colors.bg.secondary)
    root.style.setProperty('--bg-tertiary', colors.bg.tertiary)
    root.style.setProperty('--text-primary', colors.text.primary)
    root.style.setProperty('--text-secondary', colors.text.secondary)
    root.style.setProperty('--text-muted', colors.text.muted)
    root.style.setProperty('--accent-primary', colors.accent.primary)
    root.style.setProperty('--accent-hover', colors.accent.hover)
    root.style.setProperty('--accent-glow', colors.accent.glow)
    root.style.setProperty('--border-primary', colors.border.primary)
    root.style.setProperty('--border-secondary', colors.border.secondary)
    root.style.setProperty('--status-success', colors.status.success)
    root.style.setProperty('--status-error', colors.status.error)
    root.style.setProperty('--status-warning', colors.status.warning)
  }, [theme])

  return <>{children}</>
}
