import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, Lock, LogIn } from 'lucide-react'
import { useAuthStore } from '../stores/auth.store'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try { await login(form.email, form.password); navigate('/') }
    catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
            <LogIn className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">{t('auth.login')}</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t('auth.email')} type="email" icon={<Mail className="w-4 h-4" />} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <Input label={t('auth.password')} type="password" icon={<Lock className="w-4 h-4" />} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          {error && <p className="text-status-error text-sm">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>{t('auth.login')}</Button>
        </form>
        <p className="mt-6 text-center text-text-muted">{t('auth.noAccount')} <Link to="/register" className="text-accent hover:text-accent-hover transition-colors">{t('auth.registerHere')}</Link></p>
      </Card>
    </div>
  )
}
