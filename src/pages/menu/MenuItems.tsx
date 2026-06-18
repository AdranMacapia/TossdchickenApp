import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { OwnerNav } from '../../components/OwnerNav'
import { CategoryTabBar } from '../../components/CategoryTabBar'
import { PriceTag } from '../../components/PriceTag'
import type { Category, MenuItem } from '../../hooks/useMenuData'

interface FormState {
  name: string
  category_id: string
  base_price: string
  max_flavors: string
}

export default function MenuItems() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<MenuItem | null>(null)
  const [form, setForm] = useState<FormState>({ name: '', category_id: '', base_price: '', max_flavors: '1' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [catsResult, itemsResult] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('menu_items').select('*').order('name'),
    ])
    if (catsResult.error) {
      setError('Failed to load data')
    } else {
      setCategories(catsResult.data ?? [])
    }
    if (!itemsResult.error) setItems(itemsResult.data ?? [])
    setLoading(false)
  }

  const filteredItems = selectedCategoryId
    ? items.filter(i => i.category_id === selectedCategoryId)
    : items

  function openAdd() {
    setEditTarget(null)
    setForm({ name: '', category_id: categories[0]?.id ?? '', base_price: '', max_flavors: '1' })
    setError(null)
    setShowForm(true)
  }

  function openEdit(item: MenuItem) {
    setEditTarget(item)
    setForm({
      name: item.name,
      category_id: item.category_id,
      base_price: String(item.base_price),
      max_flavors: String(item.max_flavors),
    })
    setError(null)
    setShowForm(true)
  }

  async function toggleAvailability(item: MenuItem) {
    setItems(prev =>
      prev.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i)
    )
    await supabase
      .from('menu_items')
      .update({ is_available: !item.is_available })
      .eq('id', item.id)
  }

  async function handleSave() {
    const name = form.name.trim()
    const base_price = parseFloat(form.base_price)
    if (!name || isNaN(base_price) || base_price <= 0) {
      setError('Name and a valid price are required.')
      return
    }
    const max_flavors = parseInt(form.max_flavors, 10) || 1
    setSaving(true)
    setError(null)

    const payload = { name, category_id: form.category_id, base_price, max_flavors }
    const { error } = editTarget
      ? await supabase.from('menu_items').update(payload).eq('id', editTarget.id)
      : await supabase.from('menu_items').insert({ ...payload, is_available: true })

    if (error) {
      setError('Failed to save')
      setSaving(false)
      return
    }
    setShowForm(false)
    setSaving(false)
    await load()
  }

  async function handleDelete(item: MenuItem) {
    const { error } = await supabase.from('menu_items').delete().eq('id', item.id)
    if (error) setError('Failed to delete')
    else setItems(prev => prev.filter(i => i.id !== item.id))
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <OwnerNav title="Menu Items" backTo="/menu/categories" />
      <CategoryTabBar
        categories={categories}
        selectedId={selectedCategoryId}
        onSelect={setSelectedCategoryId}
      />

      <div className="px-4 py-4 flex-1">
        <div className="flex justify-end mb-4">
          <button
            onClick={openAdd}
            className="bg-brand-primary text-brand-text px-4 py-2 rounded-btn text-sm font-bold"
          >
            + Add Item
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {loading ? (
          <p className="text-gray-400 text-sm">Loading…</p>
        ) : filteredItems.length === 0 ? (
          <p className="text-gray-400 text-sm text-center mt-8">No items yet.</p>
        ) : (
          <ul className="space-y-2">
            {filteredItems.map(item => (
              <li key={item.id} className="bg-white rounded-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-brand-text leading-snug">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <PriceTag price={item.base_price} />
                      {item.max_flavors > 1 && (
                        <span className="text-xs text-gray-400">up to {item.max_flavors} flavors</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleAvailability(item)}
                    aria-label={item.is_available ? 'Available' : 'Unavailable'}
                    className={`shrink-0 w-10 h-5 rounded-full relative transition-colors ${
                      item.is_available ? 'bg-brand-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                        item.is_available ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => navigate(`/menu/items/${item.id}/flavors`)}
                    className="text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded"
                  >
                    Flavors
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-xs text-brand-accent border border-brand-accent/30 px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="font-bold text-brand-text mb-4">
              {editTarget ? 'Edit Item' : 'New Item'}
            </h2>
            <label className="block mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</span>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-card px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                placeholder="e.g. Solo"
                autoFocus
              />
            </label>
            <label className="block mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</span>
              <select
                value={form.category_id}
                onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-card px-3 py-2 text-sm"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="block mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Base Price (₱)</span>
              <input
                type="number"
                value={form.base_price}
                onChange={e => setForm(f => ({ ...f, base_price: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-card px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                placeholder="89.00"
                min={0}
                step={0.01}
              />
            </label>
            <label className="block mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Max Flavors</span>
              <input
                type="number"
                value={form.max_flavors}
                onChange={e => setForm(f => ({ ...f, max_flavors: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-card px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                min={1}
                max={10}
              />
            </label>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-200 text-gray-500 py-2 rounded-btn text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="flex-1 bg-brand-primary text-brand-text py-2 rounded-btn text-sm font-bold disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
