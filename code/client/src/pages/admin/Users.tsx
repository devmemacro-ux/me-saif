import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Edit2, Search, User, Activity, ArrowLeft, ShoppingBag, Wallet, Bell, DollarSign, Package, Ban, ShoppingCart, RotateCcw, MoreVertical } from 'lucide-react'
import { api } from '../../lib/api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Card from '../../components/ui/Card'

interface UserType { id: string; email: string; name: string; balance: number; role: string; is_banned?: number; can_purchase?: number; ban_reason?: string; created_at: string }

export default function Users() {
  const { t } = useTranslation()
  const [users, setUsers] = useState<UserType[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<UserType | null>(null)
  const [balance, setBalance] = useState('')
  const [loading, setLoading] = useState(false)
  const [activityUser, setActivityUser] = useState<any>(null)
  const [activity, setActivity] = useState<any>(null)
  const [activityTab, setActivityTab] = useState<'orders' | 'deposits' | 'notifications'>('orders')
  const [actionMenu, setActionMenu] = useState<string | null>(null)
  const [banModal, setBanModal] = useState<UserType | null>(null)
  const [banReason, setBanReason] = useState('')

  const fetch = () => api.get<UserType[]>('/admin/users').then(setUsers)
  useEffect(() => { fetch() }, [])

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))

  const handleSave = async () => {
    if (!selected) return
    setLoading(true)
    try {
      await api.put(`/admin/users/${selected.id}/balance`, { balance: parseFloat(balance) })
      setSelected(null)
      fetch()
    } finally { setLoading(false) }
  }

  const handleBan = async (u: UserType, ban: boolean) => {
    if (ban) { setBanModal(u); return }
    await api.put(`/admin/users/${u.id}/ban`, { banned: false })
    fetch()
    setActionMenu(null)
  }

  const confirmBan = async () => {
    if (!banModal) return
    setLoading(true)
    await api.put(`/admin/users/${banModal.id}/ban`, { banned: true, reason: banReason })
    setBanModal(null)
    setBanReason('')
    setLoading(false)
    fetch()
  }

  const handlePurchaseToggle = async (u: UserType) => {
    await api.put(`/admin/users/${u.id}/purchase`, { canPurchase: !u.can_purchase })
    fetch()
    setActionMenu(null)
  }

  const handleResetBalance = async (u: UserType) => {
    if (!confirm(`Reset ${u.name}'s balance to $0?`)) return
    await api.put(`/admin/users/${u.id}/reset-balance`)
    fetch()
    setActionMenu(null)
  }

  const openEdit = (u: UserType) => { setSelected(u); setBalance(String(u.balance)); setActionMenu(null) }

  const openActivity = async (u: UserType) => {
    setActivityUser(u)
    setActionMenu(null)
    const data = await api.get(`/admin/users/${u.id}/activity`)
    setActivity(data)
  }

  const closeActivity = () => { setActivityUser(null); setActivity(null); setActivityTab('orders') }

  if (activityUser && activity) {
    return (
      <div className="space-y-4">
        <button onClick={closeActivity} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </button>

        {/* User Header */}
        <Card className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${activity.user.is_banned ? 'bg-status-error/20' : 'bg-gradient-to-br from-accent/20 to-accent/5'}`}>
            <User className={`w-8 h-8 ${activity.user.is_banned ? 'text-status-error' : 'text-accent'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{activity.user.name}</h1>
              {activity.user.is_banned ? (
                <span className="px-2 py-0.5 bg-status-error/20 text-status-error text-xs rounded-full">Banned</span>
              ) : null}
              {!activity.user.can_purchase ? (
                <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-400 text-xs rounded-full">No Purchase</span>
              ) : null}
            </div>
            <p className="text-text-muted">{activity.user.email}</p>
            <p className="text-xs text-text-muted mt-1">Joined {new Date(activity.user.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-xl">
            <Wallet className="w-5 h-5 text-accent" />
            <span className="text-accent font-bold text-lg">${activity.user.balance.toFixed(2)}</span>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Orders', value: activity.stats.totalOrders, icon: ShoppingBag, color: 'text-blue-400' },
            { label: 'Total Spent', value: `$${activity.stats.totalSpent.toFixed(2)}`, icon: DollarSign, color: 'text-accent' },
            { label: 'Total Deposits', value: `$${activity.stats.totalDeposits.toFixed(2)}`, icon: Wallet, color: 'text-green-400' },
            { label: 'Pending', value: activity.stats.pendingDeposits, icon: Bell, color: 'text-yellow-400' }
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="!p-3">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs text-text-muted">{label}</span>
              </div>
              <p className={`text-lg font-bold mt-1 ${color}`}>{value}</p>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-2">
          {[
            { key: 'orders', label: 'Orders', icon: ShoppingBag, count: activity.orders.length },
            { key: 'deposits', label: 'Deposits', icon: Wallet, count: activity.deposits.length },
            { key: 'notifications', label: 'Notifications', icon: Bell, count: activity.notifications.length }
          ].map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActivityTab(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activityTab === key ? 'bg-accent text-bg-primary' : 'text-text-muted hover:bg-bg-tertiary'}`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-black/20">{count}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <Card className="!p-0 overflow-hidden">
          {activityTab === 'orders' && (
            activity.orders.length === 0 ? (
              <p className="p-6 text-center text-text-muted">No orders yet</p>
            ) : (
              <div className="divide-y divide-border-secondary">
                {activity.orders.map((o: any) => (
                  <div key={o.id} className="p-4 flex items-center gap-4 hover:bg-bg-tertiary/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{o.product_name}</p>
                      <p className="text-xs text-text-muted">{o.uc_amount} UC • Player ID: {o.player_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-accent font-bold">${o.amount}</p>
                      <p className="text-xs text-text-muted">{new Date(o.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activityTab === 'deposits' && (
            activity.deposits.length === 0 ? (
              <p className="p-6 text-center text-text-muted">No deposits yet</p>
            ) : (
              <div className="divide-y divide-border-secondary">
                {activity.deposits.map((d: any) => (
                  <div key={d.id} className="p-4 flex items-center gap-4 hover:bg-bg-tertiary/50 transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${d.status === 'approved' ? 'bg-status-success/10' : d.status === 'rejected' ? 'bg-status-error/10' : 'bg-yellow-400/10'}`}>
                      <Wallet className={`w-5 h-5 ${d.status === 'approved' ? 'text-status-success' : d.status === 'rejected' ? 'text-status-error' : 'text-yellow-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">${d.amount}</p>
                      <p className="text-xs text-text-muted font-mono truncate">{d.transaction_id}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-lg text-xs ${d.status === 'approved' ? 'bg-status-success/20 text-status-success' : d.status === 'rejected' ? 'bg-status-error/20 text-status-error' : 'bg-yellow-400/20 text-yellow-400'}`}>
                        {d.status}
                      </span>
                      <p className="text-xs text-text-muted mt-1">{new Date(d.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activityTab === 'notifications' && (
            activity.notifications.length === 0 ? (
              <p className="p-6 text-center text-text-muted">No notifications</p>
            ) : (
              <div className="divide-y divide-border-secondary">
                {activity.notifications.map((n: any) => (
                  <div key={n.id} className={`p-4 hover:bg-bg-tertiary/50 transition-colors ${n.is_read ? 'opacity-50' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{n.title}</p>
                      <span className="text-xs text-text-muted">{new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-text-muted">{n.message}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold gradient-text">{t('admin.users')}</h1>

      {/* Search */}
      <Input icon={<Search className="w-4 h-4" />} placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />

      {/* Mobile Cards View */}
      <div className="lg:hidden space-y-3">
        {filtered.map(u => (
          <Card key={u.id} className={`space-y-3 ${u.is_banned ? 'border-status-error/50' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${u.is_banned ? 'bg-status-error/10' : 'bg-accent/10'}`}>
                  <User className={`w-5 h-5 ${u.is_banned ? 'text-status-error' : 'text-accent'}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{u.name}</p>
                    {u.is_banned ? <span className="px-1.5 py-0.5 bg-status-error/20 text-status-error text-[10px] rounded">Banned</span> : null}
                  </div>
                  <p className="text-xs text-text-muted truncate">{u.email}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-lg text-xs ${u.role === 'admin' ? 'bg-accent/20 text-accent' : 'bg-bg-tertiary text-text-secondary'}`}>{u.role}</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border-secondary">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">Balance: </span>
                <span className="text-accent font-bold">${u.balance.toFixed(2)}</span>
                {!u.can_purchase ? <ShoppingCart className="w-4 h-4 text-yellow-400 line-through" /> : null}
              </div>
              <div className="relative">
                <button onClick={() => setActionMenu(actionMenu === u.id ? null : u.id)} className="p-2 hover:bg-bg-tertiary rounded-lg text-text-muted">
                  <MoreVertical className="w-4 h-4" />
                </button>
                {actionMenu === u.id && (
                  <div className="absolute right-0 bottom-full mb-1 w-48 bg-bg-secondary border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                    <button onClick={() => openActivity(u)} className="w-full px-4 py-2 text-left text-sm hover:bg-bg-tertiary flex items-center gap-2"><Activity className="w-4 h-4" /> View Activity</button>
                    <button onClick={() => openEdit(u)} className="w-full px-4 py-2 text-left text-sm hover:bg-bg-tertiary flex items-center gap-2"><Edit2 className="w-4 h-4" /> Edit Balance</button>
                    <button onClick={() => handleResetBalance(u)} className="w-full px-4 py-2 text-left text-sm hover:bg-bg-tertiary flex items-center gap-2 text-yellow-400"><RotateCcw className="w-4 h-4" /> Reset Balance</button>
                    <button onClick={() => handlePurchaseToggle(u)} className="w-full px-4 py-2 text-left text-sm hover:bg-bg-tertiary flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> {u.can_purchase ? 'Disable' : 'Enable'} Purchase</button>
                    {u.role !== 'admin' && (
                      <button onClick={() => handleBan(u, !u.is_banned)} className={`w-full px-4 py-2 text-left text-sm hover:bg-bg-tertiary flex items-center gap-2 ${u.is_banned ? 'text-status-success' : 'text-status-error'}`}>
                        <Ban className="w-4 h-4" /> {u.is_banned ? 'Unban User' : 'Ban User'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden lg:block overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-tertiary">
              <tr>
                <th className="p-4 text-left text-text-secondary font-medium">{t('admin.name')}</th>
                <th className="p-4 text-left text-text-secondary font-medium">Email</th>
                <th className="p-4 text-center text-text-secondary font-medium">{t('account.balance')}</th>
                <th className="p-4 text-center text-text-secondary font-medium">{t('admin.status')}</th>
                <th className="p-4 text-center text-text-secondary font-medium">Joined</th>
                <th className="p-4 text-center text-text-secondary font-medium">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className={`border-t border-border-secondary hover:bg-bg-tertiary/50 transition-colors ${u.is_banned ? 'bg-status-error/5' : ''}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${u.is_banned ? 'bg-status-error/10' : 'bg-accent/10'}`}>
                        <User className={`w-4 h-4 ${u.is_banned ? 'text-status-error' : 'text-accent'}`} />
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-text-secondary">{u.email}</td>
                  <td className="p-4 text-center text-accent font-bold">${u.balance.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                      <span className={`px-2 py-1 rounded-lg text-xs ${u.role === 'admin' ? 'bg-accent/20 text-accent' : 'bg-bg-tertiary text-text-secondary'}`}>{u.role}</span>
                      {u.is_banned ? <span className="px-2 py-1 rounded-lg text-xs bg-status-error/20 text-status-error">Banned</span> : null}
                      {!u.can_purchase ? <span className="px-2 py-1 rounded-lg text-xs bg-yellow-400/20 text-yellow-400">No Buy</span> : null}
                    </div>
                  </td>
                  <td className="p-4 text-center text-text-muted text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-center">
                    <div className="relative inline-block">
                      <button onClick={() => setActionMenu(actionMenu === u.id ? null : u.id)} className="p-2 hover:bg-bg-tertiary rounded-lg text-text-muted hover:text-text-primary transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {actionMenu === u.id && (
                        <div className="absolute right-0 bottom-full mb-1 w-48 bg-bg-secondary border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                          <button onClick={() => openActivity(u)} className="w-full px-4 py-2 text-left text-sm hover:bg-bg-tertiary flex items-center gap-2"><Activity className="w-4 h-4" /> View Activity</button>
                          <button onClick={() => openEdit(u)} className="w-full px-4 py-2 text-left text-sm hover:bg-bg-tertiary flex items-center gap-2"><Edit2 className="w-4 h-4" /> Edit Balance</button>
                          <button onClick={() => handleResetBalance(u)} className="w-full px-4 py-2 text-left text-sm hover:bg-bg-tertiary flex items-center gap-2 text-yellow-400"><RotateCcw className="w-4 h-4" /> Reset Balance</button>
                          <button onClick={() => handlePurchaseToggle(u)} className="w-full px-4 py-2 text-left text-sm hover:bg-bg-tertiary flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> {u.can_purchase ? 'Disable' : 'Enable'} Purchase</button>
                          {u.role !== 'admin' && (
                            <button onClick={() => handleBan(u, !u.is_banned)} className={`w-full px-4 py-2 text-left text-sm hover:bg-bg-tertiary flex items-center gap-2 ${u.is_banned ? 'text-status-success' : 'text-status-error'}`}>
                              <Ban className="w-4 h-4" /> {u.is_banned ? 'Unban User' : 'Ban User'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Balance Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Edit User Balance">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-bg-tertiary rounded-lg">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <User className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="font-semibold">{selected?.name}</p>
              <p className="text-sm text-text-muted">{selected?.email}</p>
            </div>
          </div>
          <Input label={`${t('account.balance')} (Current: $${selected?.balance.toFixed(2)})`} type="number" step="0.01" value={balance} onChange={e => setBalance(e.target.value)} />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setSelected(null)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} loading={loading} className="flex-1">{t('account.save')}</Button>
          </div>
        </div>
      </Modal>

      {/* Ban User Modal */}
      <Modal isOpen={!!banModal} onClose={() => { setBanModal(null); setBanReason('') }} title="Ban User">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-status-error/10 rounded-lg border border-status-error/20">
            <div className="w-12 h-12 rounded-full bg-status-error/20 flex items-center justify-center">
              <Ban className="w-6 h-6 text-status-error" />
            </div>
            <div>
              <p className="font-semibold">{banModal?.name}</p>
              <p className="text-sm text-text-muted">{banModal?.email}</p>
            </div>
          </div>
          <p className="text-sm text-text-muted">This user will be logged out and unable to access their account.</p>
          <Input label="Ban Reason (optional)" value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="e.g., Violation of terms of service" />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => { setBanModal(null); setBanReason('') }} className="flex-1">Cancel</Button>
            <Button onClick={confirmBan} loading={loading} className="flex-1 !bg-status-error hover:!bg-status-error/80">Ban User</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
