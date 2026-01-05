import { useState } from 'react'
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Package, Users, Wallet, ShoppingBag, Gamepad2, ArrowLeft, Menu, X, Settings } from 'lucide-react'
import { useAuthStore } from '../../stores/auth.store'

export default function AdminLayout() {
  const { t } = useTranslation()
  const { user, loading } = useAuthStore()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) return null
  if (!user || user.role !== 'admin') return <Navigate to="/" />

  const links = [
    { path: '/admin', label: t('admin.dashboard'), icon: LayoutDashboard },
    { path: '/admin/products', label: t('admin.products'), icon: Package },
    { path: '/admin/users', label: t('admin.users'), icon: Users },
    { path: '/admin/deposits', label: t('admin.deposits'), icon: Wallet },
    { path: '/admin/orders', label: t('admin.orders'), icon: ShoppingBag },
    { path: '/admin/settings', label: t('admin.settings'), icon: Settings }
  ]

  const NavContent = () => (
    <>
      <Link to="/" className="flex items-center gap-2 mb-8 group">
        <Gamepad2 className="w-6 h-6 text-accent" />
        <span className="text-lg font-bold gradient-text">Fayez STORE</span>
      </Link>
      <nav className="space-y-1 flex-1">
        {links.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${location.pathname === path ? 'bg-accent text-bg-primary glow-border' : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'}`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>
      <Link to="/" className="flex items-center gap-2 px-4 py-3 text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Store
      </Link>
    </>
  )

  return (
    <div className="min-h-screen flex bg-bg-primary">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-accent" />
          <span className="font-bold gradient-text">Admin</span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-bg-tertiary rounded-lg">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 glass border-r border-border p-4 flex flex-col transform transition-transform lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} pt-16 lg:pt-4`}>
        <NavContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto pt-20 lg:pt-8">
        <Outlet />
      </main>
    </div>
  )
}
