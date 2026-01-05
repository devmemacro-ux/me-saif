import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, ShoppingBag, CheckCircle } from 'lucide-react'
import { api } from '../../lib/api'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'

interface Order { id: string; user_name: string; email: string; product_name: string; uc_amount: number; amount: number; code: string; player_id: string; status: string; created_at: string }

export default function Orders() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState<Order[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => { api.get<Order[]>('/admin/orders').then(setOrders) }, [])

  const filtered = orders.filter(o => 
    o.user_name.toLowerCase().includes(search.toLowerCase()) || 
    o.email.toLowerCase().includes(search.toLowerCase()) ||
    o.product_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold gradient-text">{t('admin.orders')}</h1>

      {/* Search */}
      <Input icon={<Search className="w-4 h-4" />} placeholder="Search by name, email or product..." value={search} onChange={e => setSearch(e.target.value)} />

      {/* Mobile Cards View */}
      <div className="lg:hidden space-y-3">
        {filtered.map(o => (
          <Card key={o.id} className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{o.user_name}</p>
                <p className="text-xs text-text-muted truncate">{o.email}</p>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm bg-status-success/20 text-status-success">
                <CheckCircle className="w-3 h-3" />
                {o.status}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-bg-tertiary rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{o.product_name}</p>
                <p className="text-sm text-accent">{o.uc_amount} UC</p>
              </div>
              <p className="text-xl font-bold">${o.amount}</p>
            </div>
            <div className="flex items-center justify-between text-sm pt-3 border-t border-border-secondary">
              <span className="text-text-muted">Player ID: <span className="text-text-primary font-mono">{o.player_id}</span></span>
              <span className="text-text-muted">{new Date(o.created_at).toLocaleDateString()}</span>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="text-center py-8">
            <p className="text-text-muted">No orders found</p>
          </Card>
        )}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden lg:block overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-tertiary">
              <tr>
                <th className="p-4 text-left text-text-secondary font-medium">{t('admin.user')}</th>
                <th className="p-4 text-left text-text-secondary font-medium">Product</th>
                <th className="p-4 text-center text-text-secondary font-medium">UC</th>
                <th className="p-4 text-center text-text-secondary font-medium">{t('account.amount')}</th>
                <th className="p-4 text-center text-text-secondary font-medium">Player ID</th>
                <th className="p-4 text-center text-text-secondary font-medium">{t('admin.status')}</th>
                <th className="p-4 text-center text-text-secondary font-medium">{t('admin.date')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} className="border-t border-border-secondary hover:bg-bg-tertiary/50 transition-colors">
                  <td className="p-4">
                    <p className="font-medium">{o.user_name}</p>
                    <p className="text-xs text-text-muted">{o.email}</p>
                  </td>
                  <td className="p-4 font-medium">{o.product_name}</td>
                  <td className="p-4 text-center text-accent font-bold">{o.uc_amount}</td>
                  <td className="p-4 text-center font-bold">${o.amount}</td>
                  <td className="p-4 text-center font-mono text-sm text-text-secondary">{o.player_id}</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm bg-status-success/20 text-status-success">
                      <CheckCircle className="w-3 h-3" />
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4 text-center text-sm text-text-muted">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
