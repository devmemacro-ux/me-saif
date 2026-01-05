import { useTranslation } from 'react-i18next'
import { Palette } from 'lucide-react'
import { useTheme, themes } from '../../lib/theme'

export default function ThemeSwitcher() {
  const { t } = useTranslation()
  const { current, setTheme } = useTheme()

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-text-secondary">
        <Palette className="w-4 h-4" />
        <span className="text-sm font-medium">Theme</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {Object.entries(themes).map(([key, theme]) => (
          <button
            key={key}
            onClick={() => setTheme(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${current === key ? 'ring-2 ring-accent' : 'hover:bg-bg-tertiary'}`}
            style={{ background: theme.colors.bg.secondary, color: theme.colors.accent.primary, borderColor: theme.colors.border.primary, borderWidth: 1 }}
          >
            {theme.name}
          </button>
        ))}
      </div>
    </div>
  )
}
