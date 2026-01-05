import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { ThemeProvider } from './components/shared/ThemeProvider'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Store from './pages/Store'
import Account from './pages/Account'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminUsers from './pages/admin/Users'
import AdminDeposits from './pages/admin/Deposits'
import AdminOrders from './pages/admin/Orders'
import AdminSettings from './pages/admin/Settings'
import { useAuthStore } from './stores/auth.store'

export default function App() {
  const { i18n } = useTranslation()
  const checkAuth = useAuthStore(s => s.checkAuth)
  
  useEffect(() => { checkAuth() }, [])
  useEffect(() => { document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr' }, [i18n.language])

  return (
    <ThemeProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/store" element={<Store />} />
          <Route path="/account/*" element={<Account />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="deposits" element={<AdminDeposits />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}
