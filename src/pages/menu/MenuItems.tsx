import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { OwnerNav } from '../../components/OwnerNav'
import { CategoryTabBar } from '../../components/CategoryTabBar'
import { PriceTag } from '../../components/PriceTag'
import { useAnimatedNavigate } from '../../hooks/useAnimatedNavigate'
import type { Category, MenuItem } from '../../hooks/useMenuData'

interface FormState {
  name: string
  category_id: string
  base_price: string
  max_flavors: string
}

export default function MenuItems() {
  const navigate = useAnimatedNavigate()
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
    if (itemsResult.error) {
      setError('Failed to load data')
    } else {
      setItems(itemsResult.data ?? [])
    }
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
    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: !item.is_available })
      .eq('id', item.id)
    if (error) {
      setItems(prev =>
        prev.map(i => i.id === item.id ? { ...i, is_available: item.is_available } : i)
      )
      setError('Failed to update availability')
    }
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
    const { data } = await supabase.from('flavors').select('id').eq('menu_item_id', item.id).limit(1)
    if (data && data.length > 0) {
      setError(`Cannot delete "${item.name}" — remove its flavors first.`)
      return
    }
    const { error } = await supabase.from('menu_items').delete().eq('id', item.id)
    if (error) setError('Failed to delete')
    else setItems(prev => prev.filter(i => i.id !== item.id))
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <OwnerNav title="Menu Items" backTo="/menu/categories" />
      <CategoryTabBar
        categories={categories}
        selectedId={selectedCategoryId}
        onSelect={setSelectedCategoryId}
      />

      <div className="px-4 py-5 flex-1">
        <div className="flex justify-end mb-5">
          <button
            onClick={openAdd}
            className="bg-brand-primary text-brand-text px-4 py-2 rounded-btn text-sm font-bold transition-transform active:scale-[0.98]"
          >
            + Add Item
          </button>
        </div>

        {error && (
          <p className="text-sm text-brand-accent mb-4 px-1">{error}</p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No items yet.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filteredItems.map((item, i) => (
              <li
                key={item.id}
                className="bg-white border border-[#EAEAEA] rounded-[8px] p-4 list-item-animate"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-brand-text leading-snug">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <PriceTag price={item.base_price} />
                      {item.max_flavors > 1 && (
                        <span className="text-xs text-gray-400">up to {item.max_flavors} flavors</span>
                      )}
                    </div>
                  </div>

                  {/* Availability toggle */}
                  <button
                    onClick={() => toggleAvailability(item)}
                    aria-label={item.is_available ? 'Available' : 'Unavailable'}
                    className={`shrink-0 w-10 h-[22px] rounded-full relative transition-colors ${
                      item.is_available ? 'bg-brand-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                        item.is_available ? 'translate-x-[22px]' : 'translate-x-[3px]'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => navigate(`/menu/items/${item.id}/flavors`)}
                    className="text-xs text-gray-500 border border-[#EAEAEA] px-2.5 py-1 rounded-[6px] hover:border-gray-300 transition-colors"
                  >
                    Flavors
                  </button>
                  <button
                    onClick={() => navigate(`/inventory/recipes/${item.id}`)}
                    className="text-xs text-gray-500 border border-[#EAEAEA] px-2.5 py-1 rounded-[6px] hover:border-gray-300 transition-colors"
                  >
                    Recipe
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="text-xs text-gray-500 border border-[#EAEAEA] px-2.5 py-1 rounded-[6px] hover:border-gray-300 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-xs text-brand-accent border border-brand-accent/30 px-2.5 py-1 rounded-[6px] hover:bg-brand-accent/5 transition-colors"
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
          className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white w-full sm:max-w-sm rounded-t-[12px] sm:rounded-[12px] p-6 modal-enter"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="font-bold text-brand-text mb-5">
              {editTarget ? 'Edit Item' : 'New Item'}
            </h2>

            <label className="block mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</span>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="mt-1.5 w-full border border-[#EAEAEA] rounded-[6px] px-3 py-2.5 text-sm focus:outline-none focus:border-brand-primary transition-colors"
                placeholder="e.g. Solo"
                autoFocus
              />
            </label>

            <label className="block mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</span>
              <select
                value={form.category_id}
                onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                className="mt-1.5 w-full border border-[#EAEAEA] rounded-[6px] px-3 py-2.5 text-sm focus:outline-none focus:border-brand-primary transition-colors"
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
                className="mt-1.5 w-full border border-[#EAEAEA] rounded-[6px] px-3 py-2.5 text-sm focus:outline-none focus:border-brand-primary transition-colors"
                placeholder="89.00"
                min={0}
                step={0.01}
              />
            </label>

            <label className="block mb-5">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Max Flavors</span>
              <input
                type="number"
                value={form.max_flavors}
                onChange={e => setForm(f => ({ ...f, max_flavors: e.target.value }))}
                className="mt-1.5 w-full border border-[#EAEAEA] rounded-[6px] px-3 py-2.5 text-sm focus:outline-none focus:border-brand-primary transition-colors"
                min={1}
                max={10}
              />
            </label>

            {error && <p className="text-sm text-brand-accent mb-4">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-[#EAEAEA] text-gray-500 py-2.5 rounded-btn text-sm font-semibold hover:border-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="flex-1 bg-brand-primary text-brand-text py-2.5 rounded-btn text-sm font-bold transition-transform active:scale-[0.98] disabled:opacity-50"
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
