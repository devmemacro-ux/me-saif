import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, ShoppingBag, Wallet, Settings, Copy, Check } from 'lucide-react'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth.store'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import ThemeSwitcher from '../components/shared/ThemeSwitcher'

function Overview() {
  const { t } = useTranslation()
  const user = useAuthStore(s => s.user)
  const [copied, setCopied] = useState(false)
  const copyId = () => { navigator.clipboard.writeText(user?.id || ''); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card glow>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-text-muted text-sm">{t('account.balance')}</p>
            <p className="text-3xl font-bold text-accent">${user?.balance.toFixed(2)}</p>
          </div>
        </div>
      </Card>
      <Card>
        <p className="text-text-muted text-sm mb-1">User ID</p>
        <div className="flex items-center gap-2">
          <p className="font-mono text-lg">{user?.id}</p>
          <button onClick={copyId} className="p-1.5 hover:bg-bg-tertiary rounded-lg transition-colors">
            {copied ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4 text-text-muted" />}
          </button>
        </div>
      </Card>
    </div>
  )
}

function Orders() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState<any[]>([])
  useEffect(() => { api.get<any[]>('/orders').then(setOrders) }, [])

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{t('account.orderHistory')}</h2>
      {orders.length === 0 ? <p className="text-text-muted">{t('account.noOrders')}</p> : (
        <div className="space-y-3">
          {orders.map(o => (
            <Card key={o.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{o.product_name} - {o.uc_amount} UC</p>
                <p className="text-sm text-text-muted">{new Date(o.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-accent">{o.code}</p>
                <p className="text-sm text-text-muted">${o.amount}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function WalletPage() {
  const { t } = useTranslation()
  const user = useAuthStore(s => s.user)
  const [deposits, setDeposits] = useState<any[]>([])
  const [form, setForm] = useState({ amount: '', transactionId: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { api.get<any[]>('/wallet/deposits').then(setDeposits) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/wallet/deposit', { amount: parseFloat(form.amount), transactionId: form.transactionId })
      setMsg('Deposit request submitted!')
      setForm({ amount: '', transactionId: '' })
      api.get<any[]>('/wallet/deposits').then(setDeposits)
    } catch (err: any) { setMsg(err.message) }
    finally { setLoading(false) }
  }

  const statusColor = (s: string) => s === 'approved' ? 'text-status-success' : s === 'rejected' ? 'text-status-error' : 'text-status-warning'

  return (
    <div className="space-y-6">
      <Card glow>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-text-muted text-sm">{t('account.balance')}</p>
            <p className="text-3xl font-bold text-accent">${user?.balance.toFixed(2)}</p>
          </div>
        </div>
        <h4 className="font-semibold mb-3">{t('account.addFunds')}</h4>
        <p className="text-sm text-text-muted mb-4">Send USDT to: <span className="font-mono text-accent">TRC20-ADDRESS-HERE</span></p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label={t('account.amount')} type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
          <Input label={t('account.transactionId')} value={form.transactionId} onChange={e => setForm({ ...form, transactionId: e.target.value })} required />
          {msg && <p className="text-sm text-accent">{msg}</p>}
          <Button type="submit" loading={loading}>{t('account.submit')}</Button>
        </form>
      </Card>
      <Card>
        <h4 className="font-semibold mb-4">Deposit History</h4>
        {deposits.length === 0 ? <p className="text-text-muted">No deposits yet</p> : (
          <div className="space-y-2">
            {deposits.map(d => (
              <div key={d.id} className="flex justify-between py-3 border-b border-border-secondary last:border-0">
                <span className="font-medium">${d.amount}</span>
                <span className={`font-medium ${statusColor(d.status)}`}>{t(`account.${d.status}`)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function SettingsPage() {
  const { t, i18n } = useTranslation()
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' })
  const [msg, setMsg] = useState('')

  const changeLang = (lang: string) => { i18n.changeLanguage(lang); localStorage.setItem('lang', lang); api.put('/auth/language', { language: lang }) }
  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try { await api.put('/auth/password', pwForm); setMsg('Password changed!'); setPwForm({ currentPassword: '', newPassword: '' }) }
    catch (err: any) { setMsg(err.message) }
  }

  return (
    <div className="space-y-6">
      <Card>
        <ThemeSwitcher />
      </Card>
      <Card>
        <h4 className="font-semibold mb-4">{t('account.language')}</h4>
        <div className="flex gap-2">
          <Button variant={i18n.language === 'en' ? 'primary' : 'secondary'} onClick={() => changeLang('en')}>English</Button>
          <Button variant={i18n.language === 'ar' ? 'primary' : 'secondary'} onClick={() => changeLang('ar')}>العربية</Button>
        </div>
      </Card>
      <Card>
        <h4 className="font-semibold mb-4">{t('account.changePassword')}</h4>
        <form onSubmit={changePassword} className="space-y-3">
          <Input label={t('account.currentPassword')} type="password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
          <Input label={t('account.newPassword')} type="password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} />
          {msg && <p className="text-sm text-status-success">{msg}</p>}
          <Button type="submit">{t('account.save')}</Button>
        </form>
      </Card>
    </div>
  )
}

export default function Account() {
  const { t } = useTranslation()
  const { user, loading } = useAuthStore()
  const location = useLocation()

  if (loading) return null
  if (!user) return <Navigate to="/login" />

  const tabs = [
    { path: '/account', label: t('account.overview'), icon: LayoutDashboard },
    { path: '/account/orders', label: t('account.orders'), icon: ShoppingBag },
    { path: '/account/wallet', label: t('account.wallet'), icon: Wallet },
    { path: '/account/settings', label: t('account.settings'), icon: Settings }
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 gradient-text">{t('nav.account')}</h1>
      <div className="flex gap-2 mb-8 pb-4 overflow-x-auto">
        {tabs.map(({ path, label, icon: Icon }) => (
          <Link key={path} to={path} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-all ${location.pathname === path ? 'bg-accent text-bg-primary glow-border' : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'}`}>
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </div>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="orders" element={<Orders />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Routes>
    </div>
  )
}
