import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, Check } from 'lucide-react'
import { api } from '../../lib/api'

interface Notification { id: string; type: string; title: string; message: string; is_read: number; created_at: string }

export default function NotificationBell() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<{ notifications: Notification[]; unread: number }>({ notifications: [], unread: 0 })
  const ref = useRef<HTMLDivElement>(null)

  const fetch = async () => { try { setData(await api.get('/notifications')) } catch {} }
  
  useEffect(() => { fetch(); const i = setInterval(fetch, 30000); return () => clearInterval(i) }, [])
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => { await api.put('/notifications/read-all'); fetch() }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-all">
        <Bell className="w-5 h-5" />
        {data.unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-status-error rounded-full text-xs flex items-center justify-center font-medium animate-pulse">
            {data.unread}
          </span>
        )}
      </button>
      {open && (
        <div className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 rtl:md:right-auto rtl:md:left-0 top-16 md:top-auto md:mt-2 w-auto md:w-80 glass rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="p-3 border-b border-border flex justify-between items-center">
            <span className="font-semibold">{t('notifications.title')}</span>
            {data.unread > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors">
                <Check className="w-3 h-3" />
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {data.notifications.length === 0 ? (
              <p className="p-6 text-center text-text-muted">{t('notifications.empty')}</p>
            ) : (
              data.notifications.map(n => (
                <div key={n.id} className={`p-3 border-b border-border-secondary hover:bg-bg-tertiary transition-colors ${n.is_read ? 'opacity-50' : ''}`}>
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-xs text-text-muted mt-1">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
