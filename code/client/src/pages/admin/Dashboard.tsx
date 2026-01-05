import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, ShoppingBag, DollarSign, Clock, TrendingUp, Package } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { api } from '../../lib/api'
import Card from '../../components/ui/Card'

export default function Dashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState({ users: 0, orders: 0, revenue: 0, pendingDeposits: 0 })
  const [chartData, setChartData] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [recentDeposits, setRecentDeposits] = useState<any[]>([])

  useEffect(() => {
    api.get<typeof stats>('/admin/stats').then(setStats)
    api.get<any[]>('/admin/stats/chart').then(setChartData)
    api.get<any[]>('/admin/orders').then(o => setRecentOrders(o.slice(0, 5)))
    api.get<any[]>('/admin/deposits/pending').then(setRecentDeposits)
  }, [])

  const cards = [
    { label: t('admin.totalUsers'), value: stats.users, icon: Users, color: 'text-blue-400' },
    { label: t('admin.totalOrders'), value: stats.orders, icon: ShoppingBag, color: 'text-green-400' },
    { label: t('admin.revenue'), value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, color: 'text-accent' },
    { label: t('admin.pendingDeposits'), value: stats.pendingDeposits, icon: Clock, color: 'text-yellow-400' }
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null
    return (
      <div className="bg-bg-secondary border border-border rounded-lg p-3 shadow-xl">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-sm" style={{ color: p.color }}>
            {p.name}: {p.name === 'revenue' ? `$${p.value}` : p.value}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold gradient-text">{t('admin.dashboard')}</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="group hover:glow-border transition-all">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-bg-tertiary flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 lg:w-6 lg:h-6 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-text-muted text-xs lg:text-sm truncate">{label}</p>
                <p className={`text-lg lg:text-2xl font-bold ${color}`}>{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h2 className="font-semibold">Revenue (Last 7 Days)</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={v => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="w-5 h-5 text-blue-400" />
            <h2 className="font-semibold">Orders & Users (Last 7 Days)</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" fill="#22c55e" radius={[4, 4, 0, 0]} name="orders" />
                <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} name="users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-accent" />
            <h2 className="font-semibold">Recent Orders</h2>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-text-muted text-sm">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(o => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-border-secondary last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{o.user_name}</p>
                    <p className="text-xs text-text-muted">{o.product_name}</p>
                  </div>
                  <span className="text-accent font-bold text-sm">${o.amount}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pending Deposits */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-yellow-400" />
            <h2 className="font-semibold">Pending Deposits</h2>
            {recentDeposits.length > 0 && (
              <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-400 text-xs rounded-full">{recentDeposits.length}</span>
            )}
          </div>
          {recentDeposits.length === 0 ? (
            <p className="text-text-muted text-sm">No pending deposits</p>
          ) : (
            <div className="space-y-3">
              {recentDeposits.slice(0, 5).map(d => (
                <div key={d.id} className="flex items-center justify-between py-2 border-b border-border-secondary last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{d.user_name}</p>
                    <p className="text-xs text-text-muted font-mono">{d.transaction_id}</p>
                  </div>
                  <span className="text-yellow-400 font-bold text-sm">${d.amount}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
