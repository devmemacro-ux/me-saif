import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, X, Search, Clock, CheckCircle, XCircle, Copy } from 'lucide-react'
import { api } from '../../lib/api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'

interface Deposit { id: string; user_id: string; user_name: string; email: string; amount: number; transaction_id: string; status: string; created_at: string }

export default function Deposits() {
  const { t } = useTranslation()
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [filter, setFilter] = useState<'all' | 'pending'>('pending')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const fetch = () => api.get<Deposit[]>(filter === 'pending' ? '/admin/deposits/pending' : '/admin/deposits').then(setDeposits)
  useEffect(() => { fetch() }, [filter])

  const filtered = deposits.filter(d => 
    d.user_name.toLowerCase().includes(search.toLowerCase()) || 
    d.email.toLowerCase().includes(search.toLowerCase()) ||
    d.transaction_id.toLowerCase().includes(search.toLowerCase())
  )

  const handleApprove = async (id: string) => {
    setLoading(id)
    try { await api.put(`/admin/deposits/${id}/approve`); fetch() }
    finally { setLoading(null) }
  }

  const handleReject = async (id: string) => {
    if (confirm('Reject this deposit?')) {
      setLoading(id)
      try { await api.put(`/admin/deposits/${id}/reject`); fetch() }
      finally { setLoading(null) }
    }
  }

  const copyTxId = (txId: string) => navigator.clipboard.writeText(txId)

  const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
      approved: { bg: 'bg-status-success/20', text: 'text-status-success', icon: CheckCircle },
      rejected: { bg: 'bg-status-error/20', text: 'text-status-error', icon: XCircle },
      pending: { bg: 'bg-status-warning/20', text: 'text-status-warning', icon: Clock }
    }
    const s = styles[status as keyof typeof styles] || styles.pending
    const Icon = s.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm ${s.bg} ${s.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold gradient-text">{t('admin.deposits')}</h1>
        <div className="flex gap-2">
          <Button variant={filter === 'pending' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('pending')}>
            <Clock className="w-4 h-4" />
            Pending
          </Button>
          <Button variant={filter === 'all' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('all')}>All</Button>
        </div>
      </div>

      {/* Search */}
      <Input icon={<Search className="w-4 h-4" />} placeholder="Search by name, email or transaction ID..." value={search} onChange={e => setSearch(e.target.value)} />

      {/* Mobile Cards View */}
      <div className="lg:hidden space-y-3">
        {filtered.map(d => (
          <Card key={d.id} className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{d.user_name}</p>
                <p className="text-xs text-text-muted truncate">{d.email}</p>
              </div>
              <StatusBadge status={d.status} />
            </div>
            <div className="flex items-center gap-2 p-2 bg-bg-tertiary rounded-lg">
              <span className="text-xs text-text-muted">TX:</span>
              <span className="font-mono text-xs flex-1 truncate">{d.transaction_id}</span>
              <button onClick={() => copyTxId(d.transaction_id)} className="p-1 hover:bg-bg-secondary rounded">
                <Copy className="w-3 h-3 text-text-muted" />
              </button>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border-secondary">
              <div>
                <span className="text-2xl font-bold text-accent">${d.amount}</span>
                <p className="text-xs text-text-muted">{new Date(d.created_at).toLocaleDateString()}</p>
              </div>
              {d.status === 'pending' && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(d.id)} loading={loading === d.id}>
                    <Check className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleReject(d.id)} disabled={loading === d.id}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="text-center py-8">
            <p className="text-text-muted">No deposits found</p>
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
                <th className="p-4 text-center text-text-secondary font-medium">{t('account.amount')}</th>
                <th className="p-4 text-left text-text-secondary font-medium">Transaction ID</th>
                <th className="p-4 text-center text-text-secondary font-medium">{t('admin.status')}</th>
                <th className="p-4 text-center text-text-secondary font-medium">{t('admin.date')}</th>
                <th className="p-4 text-center text-text-secondary font-medium">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="border-t border-border-secondary hover:bg-bg-tertiary/50 transition-colors">
                  <td className="p-4">
                    <p className="font-medium">{d.user_name}</p>
                    <p className="text-xs text-text-muted">{d.email}</p>
                  </td>
                  <td className="p-4 text-center text-accent font-bold text-lg">${d.amount}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-text-secondary">{d.transaction_id}</span>
                      <button onClick={() => copyTxId(d.transaction_id)} className="p-1 hover:bg-bg-tertiary rounded">
                        <Copy className="w-3 h-3 text-text-muted" />
                      </button>
                    </div>
                  </td>
                  <td className="p-4 text-center"><StatusBadge status={d.status} /></td>
                  <td className="p-4 text-center text-sm text-text-muted">{new Date(d.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-center">
                    {d.status === 'pending' && (
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleApprove(d.id)} disabled={loading === d.id} className="p-2 hover:bg-status-success/20 rounded-lg text-text-muted hover:text-status-success transition-colors disabled:opacity-50">
                          <Check className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleReject(d.id)} disabled={loading === d.id} className="p-2 hover:bg-status-error/20 rounded-lg text-text-muted hover:text-status-error transition-colors disabled:opacity-50">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
