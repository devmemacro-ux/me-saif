import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Gamepad2, Globe, User, LogOut, Shield, Wallet, Menu, X } from 'lucide-react'
import { useAuthStore } from '../../stores/auth.store'
import { useState } from 'react'
import Button from '../ui/Button'
import NotificationBell from '../shared/NotificationBell'

export default function Header() {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => { await logout(); navigate('/'); setOpen(false) }
  const toggleLang = () => { const lang = i18n.language === 'en' ? 'ar' : 'en'; i18n.changeLanguage(lang); localStorage.setItem('lang', lang) }

  return (
    <header className="sticky top-0 z-40 glass">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Gamepad2 className="w-7 h-7 text-accent group-hover:glow-text transition-all" />
          <span className="text-lg sm:text-xl font-bold gradient-text whitespace-nowrap">Fayez STORE</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          <Link to="/" className="px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-all">{t('nav.home')}</Link>
          <Link to="/store" className="px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-all">{t('nav.store')}</Link>
          <button onClick={toggleLang} className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-all">
            <Globe className="w-5 h-5" />
          </button>
          {user ? (
            <>
              <NotificationBell />
              <div className="flex items-center gap-1 px-3 py-1.5 bg-bg-tertiary rounded-lg border border-border">
                <Wallet className="w-4 h-4 text-accent" />
                <span className="text-accent font-medium">${user.balance.toFixed(2)}</span>
              </div>
              <Link to="/account" className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-all">
                <User className="w-5 h-5" />
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="p-2 text-text-secondary hover:text-accent hover:bg-bg-tertiary rounded-lg transition-all">
                  <Shield className="w-5 h-5" />
                </Link>
              )}
              <button onClick={handleLogout} className="p-2 text-text-muted hover:text-status-error hover:bg-bg-tertiary rounded-lg transition-all">
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">{t('nav.login')}</Button></Link>
              <Link to="/register"><Button size="sm">{t('nav.register')}</Button></Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-text-secondary hover:bg-bg-tertiary rounded-lg">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {open && (
        <nav className="md:hidden px-4 pb-4 flex flex-col gap-2 border-t border-border">
          <Link to="/" onClick={() => setOpen(false)} className="px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-all">{t('nav.home')}</Link>
          <Link to="/store" onClick={() => setOpen(false)} className="px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-all">{t('nav.store')}</Link>
          <div className="flex items-center gap-2 py-2">
            <button onClick={toggleLang} className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-all">
              <Globe className="w-5 h-5" />
            </button>
            {user && <NotificationBell />}
          </div>
          {user ? (
            <>
              <div className="flex items-center gap-1 px-3 py-2 bg-bg-tertiary rounded-lg border border-border w-fit">
                <Wallet className="w-4 h-4 text-accent" />
                <span className="text-accent font-medium">${user.balance.toFixed(2)}</span>
              </div>
              <Link to="/account" onClick={() => setOpen(false)} className="px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-all flex items-center gap-2">
                <User className="w-5 h-5" /> {t('nav.account')}
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setOpen(false)} className="px-3 py-2 text-text-secondary hover:text-accent hover:bg-bg-tertiary rounded-lg transition-all flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Admin
                </Link>
              )}
              <button onClick={handleLogout} className="px-3 py-2 text-text-muted hover:text-status-error hover:bg-bg-tertiary rounded-lg transition-all flex items-center gap-2">
                <LogOut className="w-5 h-5" /> {t('nav.logout')}
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setOpen(false)}><Button variant="ghost" size="sm">{t('nav.login')}</Button></Link>
              <Link to="/register" onClick={() => setOpen(false)}><Button size="sm">{t('nav.register')}</Button></Link>
            </div>
          )}
        </nav>
      )}
    </header>
  )
}
