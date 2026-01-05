import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Edit2, Trash2, Code, Package, Search } from 'lucide-react'
import { api } from '../../lib/api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Card from '../../components/ui/Card'

interface Product { id: string; name: string; uc_amount: number; price: number; is_active: number; available: number; total: number }

export default function Products() {
  const { t } = useTranslation()
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'add' | 'edit' | 'codes' | null>(null)
  const [selected, setSelected] = useState<Product | null>(null)
  const [form, setForm] = useState({ name: '', uc_amount: '', price: '' })
  const [codes, setCodes] = useState('')
  const [loading, setLoading] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetch = () => api.get<Product[]>('/admin/products').then(setProducts)
  useEffect(() => { fetch() }, [])

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  const handleSave = async () => {
    setLoading(true)
    const data = { name: form.name, uc_amount: parseInt(form.uc_amount), price: parseFloat(form.price) }
    try {
      if (selected) await api.put(`/admin/products/${selected.id}`, data)
      else await api.post('/admin/products', data)
      setModal(null); setForm({ name: '', uc_amount: '', price: '' }); setSelected(null); fetch()
    } finally { setLoading(false) }
  }

  const handleAddCodes = async () => {
    if (!selected) return
    setLoading(true)
    const codeList = codes.split('\n').map(c => c.trim()).filter(Boolean)
    try {
      await api.post(`/admin/products/${selected.id}/codes`, { codes: codeList })
      setModal(null); setCodes(''); setSelected(null); fetch()
    } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    try {
      await api.delete(`/admin/products/${id}`)
      setDeleteConfirm(null)
      fetch()
    } finally { setLoading(false) }
  }

  const openEdit = (p: Product) => { setSelected(p); setForm({ name: p.name, uc_amount: String(p.uc_amount), price: String(p.price) }); setModal('edit') }
  const openCodes = (p: Product) => { setSelected(p); setModal('codes') }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold gradient-text">{t('admin.products')}</h1>
        <Button onClick={() => { setSelected(null); setForm({ name: '', uc_amount: '', price: '' }); setModal('add') }}>
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t('admin.addProduct')}</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Search */}
      <Input icon={<Search className="w-4 h-4" />} placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />

      {/* Mobile Cards View */}
      <div className="lg:hidden space-y-3">
        {filtered.map(p => (
          <Card key={p.id} className="space-y-3">
            {deleteConfirm === p.id ? (
              <div className="flex items-center justify-between p-2 bg-status-error/10 rounded-lg border border-status-error/30">
                <span className="text-sm text-status-error">Delete "{p.name}"?</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                  <Button size="sm" onClick={() => handleDelete(p.id)} loading={loading} className="bg-status-error hover:bg-status-error/80">Delete</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-accent font-bold">{p.uc_amount} UC</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold">${p.price}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border-secondary">
                  <span className="text-sm text-text-muted">Codes: <span className="text-text-primary">{p.available}/{p.total}</span></span>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="p-2 hover:bg-bg-tertiary rounded-lg text-text-muted hover:text-text-primary"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => openCodes(p)} className="p-2 hover:bg-bg-tertiary rounded-lg text-text-muted hover:text-accent"><Code className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteConfirm(p.id)} className="p-2 hover:bg-status-error/20 rounded-lg text-text-muted hover:text-status-error"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </>
            )}
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
                <th className="p-4 text-center text-text-secondary font-medium">{t('admin.ucAmount')}</th>
                <th className="p-4 text-center text-text-secondary font-medium">{t('admin.price')}</th>
                <th className="p-4 text-center text-text-secondary font-medium">{t('admin.codes')}</th>
                <th className="p-4 text-center text-text-secondary font-medium">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-t border-border-secondary hover:bg-bg-tertiary/50 transition-colors">
                  {deleteConfirm === p.id ? (
                    <td colSpan={5} className="p-4">
                      <div className="flex items-center justify-between p-3 bg-status-error/10 rounded-lg border border-status-error/30">
                        <span className="text-status-error">Are you sure you want to delete "{p.name}"?</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                          <Button size="sm" onClick={() => handleDelete(p.id)} loading={loading} className="bg-status-error hover:bg-status-error/80">Delete</Button>
                        </div>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="p-4 font-medium">{p.name}</td>
                      <td className="p-4 text-center text-accent font-bold">{p.uc_amount}</td>
                      <td className="p-4 text-center">${p.price}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-lg text-sm ${p.available === 0 ? 'bg-status-error/20 text-status-error' : 'bg-bg-tertiary'}`}>
                          {p.available}/{p.total}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => openEdit(p)} className="p-2 hover:bg-bg-tertiary rounded-lg text-text-muted hover:text-text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => openCodes(p)} className="p-2 hover:bg-bg-tertiary rounded-lg text-text-muted hover:text-accent transition-colors"><Code className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteConfirm(p.id)} className="p-2 hover:bg-status-error/20 rounded-lg text-text-muted hover:text-status-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'add' ? t('admin.addProduct') : t('admin.edit')}>
        <div className="space-y-4">
          <Input label={t('admin.name')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. 60 UC Pack" />
          <Input label={t('admin.ucAmount')} type="number" value={form.uc_amount} onChange={e => setForm({ ...form, uc_amount: e.target.value })} placeholder="60" />
          <Input label={t('admin.price')} type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.99" />
          <Button onClick={handleSave} loading={loading} className="w-full">{t('account.save')}</Button>
        </div>
      </Modal>

      {/* Add Codes Modal */}
      <Modal isOpen={modal === 'codes'} onClose={() => setModal(null)} title={`${t('admin.addCodes')} - ${selected?.name}`}>
        <div className="space-y-4">
          <p className="text-text-muted text-sm">Enter one code per line. Current: {selected?.available}/{selected?.total}</p>
          <textarea
            className="w-full h-40 bg-bg-secondary border border-border rounded-lg p-3 text-text-primary focus:outline-none focus:border-accent transition-colors font-mono text-sm"
            value={codes}
            onChange={e => setCodes(e.target.value)}
            placeholder="CODE1&#10;CODE2&#10;CODE3"
          />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setModal(null)} className="flex-1">Cancel</Button>
            <Button onClick={handleAddCodes} loading={loading} className="flex-1">{t('account.save')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
