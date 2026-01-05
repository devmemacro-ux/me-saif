import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, Copy, Check, PackageX } from 'lucide-react'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth.store'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'

interface Product { id: string; name: string; uc_amount: number; price: number; available: number }

export default function Store() {
  const { t } = useTranslation()
  const user = useAuthStore(s => s.user)
  const updateBalance = useAuthStore(s => s.updateBalance)
  const [products, setProducts] = useState<Product[]>([])
  const [selected, setSelected] = useState<Product | null>(null)
  const [playerId, setPlayerId] = useState('')
  const [result, setResult] = useState<{ code: string } | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [fetched, setFetched] = useState(false)

  useEffect(() => { api.get<Product[]>('/products').then(p => { setProducts(p); setFetched(true) }) }, [])

  const handlePurchase = async () => {
    if (!selected || !playerId) return
    if (!user) return setError('Please login first')
    if (user.balance < selected.price) return setError(t('store.insufficientBalance'))
    setLoading(true)
    setError('')
    try {
      const res = await api.post<{ code: string }>('/products/purchase', { productId: selected.id, playerId })
      setResult(res)
      updateBalance(user.balance - selected.price)
      setProducts(products.map(p => p.id === selected.id ? { ...p, available: p.available - 1 } : p))
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  const copyCode = () => {
    if (result) { navigator.clipboard.writeText(result.code); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }

  const closeModal = () => { setSelected(null); setPlayerId(''); setResult(null); setError(''); setCopied(false) }

  if (fetched && products.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 gradient-text">{t('store.title')}</h1>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-24 h-24 rounded-full bg-status-error/10 flex items-center justify-center mb-6 border-2 border-status-error/30">
            <PackageX className="w-12 h-12 text-status-error" />
          </div>
          <h2 className="text-2xl font-bold text-status-error mb-3 text-center">{t('store.emptyTitle')}</h2>
          <p className="text-text-muted text-center max-w-md">{t('store.emptyDesc')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 gradient-text">{t('store.title')}</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <Card key={p.id} className="flex flex-col group hover:glow-border transition-all">
            <div className="relative mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-accent/20 to-accent/5">
              <img src="/uc.png" alt="UC" className="w-full h-32 object-contain p-4" />
              <div className="absolute top-2 right-2 px-2 py-1 bg-bg-primary/80 rounded-lg text-xs font-bold text-accent">{p.available} left</div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-accent">{p.uc_amount}</div>
              <div className="text-sm text-text-muted">{t('store.uc')}</div>
            </div>
            <div className="text-3xl font-bold mb-4">${p.price}</div>
            <Button onClick={() => setSelected(p)} disabled={p.available === 0} className="mt-auto">
              <ShoppingCart className="w-4 h-4" />
              {p.available === 0 ? t('store.outOfStock') : t('store.buy')}
            </Button>
          </Card>
        ))}
      </div>

      <Modal isOpen={!!selected} onClose={closeModal} title={result ? '' : selected?.name}>
        {result ? (
          <div className="text-center py-2">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-status-success/20 animate-ping" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-status-success to-green-600 flex items-center justify-center shadow-xl shadow-status-success/40">
                <Check className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">🎉 {t('store.success')}</h3>
            <p className="text-text-muted text-sm mb-6">Your UC code is ready!</p>
            <div className="relative group cursor-pointer" onClick={copyCode}>
              <div className="absolute -inset-1 bg-gradient-to-r from-accent via-purple-500 to-accent rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity" />
              <div className="relative bg-bg-tertiary p-6 rounded-xl border border-accent/30">
                <p className="text-2xl md:text-3xl font-mono font-bold tracking-widest text-accent select-all break-all">{result.code}</p>
              </div>
            </div>
            <p className="text-sm text-text-muted mt-4 flex items-center justify-center gap-2">
              {copied ? <><Check className="w-4 h-4 text-status-success" /> Copied!</> : <><Copy className="w-4 h-4" /> Tap to copy</>}
            </p>
            <Button onClick={closeModal} className="mt-6 w-full" size="lg">Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-bg-tertiary rounded-lg">
              <img src="/uc.png" alt="UC" className="w-12 h-12 object-contain" />
              <div>
                <div className="font-semibold">{selected?.uc_amount} UC</div>
                <div className="text-accent font-bold">${selected?.price}</div>
              </div>
            </div>
            <Input label={t('store.playerId')} value={playerId} onChange={e => setPlayerId(e.target.value)} placeholder="Enter your PUBG Player ID" />
            {error && <p className="text-status-error text-sm">{error}</p>}
            <Button onClick={handlePurchase} loading={loading} disabled={!playerId} className="w-full">{t('store.confirm')}</Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
