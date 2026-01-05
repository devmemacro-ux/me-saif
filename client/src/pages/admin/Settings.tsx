import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Settings2, Key, Shield, Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react'
import { api } from '../../lib/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function Settings() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState({ enabled: false, hasKeys: false, connected: false })
  const [showForm, setShowForm] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [error, setError] = useState('')

  const fetchStatus = async () => {
    try {
      const data = await api.get<typeof status>('/admin/settings/binance')
      setStatus(data)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchStatus() }, [])

  const handleSave = async () => {
    if (!apiKey || !apiSecret) return setError('Please fill all fields')
    setSaving(true)
    setError('')
    try {
      await api.post('/admin/settings/binance', { apiKey, apiSecret })
      setShowForm(false)
      setApiKey('')
      setApiSecret('')
      fetchStatus()
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleToggle = async () => {
    try {
      await api.put('/admin/settings/binance/toggle', { enabled: !status.connected })
      fetchStatus()
    } catch {}
  }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure? This will remove your API keys.')) return
    try {
      await api.delete('/admin/settings/binance')
      fetchStatus()
    } catch {}
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{t('admin.settings')}</h1>

      <Card className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 flex items-center justify-center">
            <Settings2 className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-1">{t('admin.autoVerify')}</h2>
            <p className="text-text-muted text-sm">{t('admin.autoVerifyDesc')}</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${status.connected ? 'bg-status-success/20 text-status-success' : 'bg-text-muted/20 text-text-muted'}`}>
            {status.connected ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {status.connected ? t('admin.connected') : t('admin.disconnected')}
          </div>
        </div>

        {status.hasKeys && !showForm ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-bg-tertiary rounded-xl">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-sm text-text-secondary">API keys configured securely</span>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleToggle} variant={status.connected ? 'secondary' : 'primary'} className="flex-1">
                {status.connected ? t('admin.disconnect') : t('admin.connect')}
              </Button>
              <Button onClick={() => setShowForm(true)} variant="ghost">
                {t('admin.edit')}
              </Button>
              <Button onClick={handleDisconnect} variant="ghost" className="text-status-error hover:bg-status-error/10">
                {t('admin.delete')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-bg-tertiary rounded-xl border border-border">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Key className="w-4 h-4 text-accent" />
                {t('admin.binanceSettings')}
              </h3>
              <div className="space-y-4">
                <Input
                  label={t('admin.apiKey')}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Enter your Binance API Key"
                />
                <div className="relative">
                  <Input
                    label={t('admin.apiSecret')}
                    type={showSecret ? 'text' : 'password'}
                    value={apiSecret}
                    onChange={e => setApiSecret(e.target.value)}
                    placeholder="Enter your Binance API Secret"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-9 text-text-muted hover:text-text-primary"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-status-error text-sm mt-3">{error}</p>}
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSave} loading={saving} className="flex-1">
                {saving ? t('admin.connecting') : t('admin.saveKeys')}
              </Button>
              {status.hasKeys && (
                <Button onClick={() => { setShowForm(false); setApiKey(''); setApiSecret('') }} variant="ghost">
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
