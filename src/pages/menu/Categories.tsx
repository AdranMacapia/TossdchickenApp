import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { OwnerNav } from '../../components/OwnerNav'

interface Category {
  id: string
  name: string
  sort_order: number
}

interface FormState {
  name: string
  sort_order: string
}

export default function Categories() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [form, setForm] = useState<FormState>({ name: '', sort_order: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from('categories').select('*').order('sort_order')
    if (!error) setCategories(data ?? [])
    setLoading(false)
  }

  function openAdd() {
    setEditTarget(null)
    setForm({ name: '', sort_order: String(categories.length + 1) })
    setError(null)
    setShowForm(true)
  }

  function openEdit(cat: Category) {
    setEditTarget(cat)
    setForm({ name: cat.name, sort_order: String(cat.sort_order) })
    setError(null)
    setShowForm(true)
  }

  async function handleSave() {
    const name = form.name.trim()
    if (!name) return
    const sort_order = Number(form.sort_order) || categories.length + 1
    setSaving(true)
    setError(null)

    const payload = { name, sort_order }
    const { error } = editTarget
      ? await supabase.from('categories').update(payload).eq('id', editTarget.id)
      : await supabase.from('categories').insert(payload)

    if (error) {
      setError('Failed to save')
    } else {
      setShowForm(false)
      await load()
    }
    setSaving(false)
  }

  async function handleDelete(cat: Category) {
    const { data } = await supabase
      .from('menu_items').select('id').eq('category_id', cat.id).limit(1)
    if (data && data.length > 0) {
      setError(`Cannot delete "${cat.name}" — remove its menu items first.`)
      return
    }
    const { error } = await supabase.from('categories').delete().eq('id', cat.id)
    if (error) setError('Failed to delete')
    else await load()
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <OwnerNav title="Categories" backTo="/reports/dashboard" />

      <div className="px-4 py-4 flex-1">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/menu/items')}
            className="text-sm text-gray-500 underline"
          >
            Menu Items →
          </button>
          <button
            onClick={openAdd}
            className="bg-brand-primary text-brand-text px-4 py-2 rounded-btn text-sm font-bold"
          >
            + Add Category
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {loading ? (
          <p className="text-gray-400 text-sm">Loading…</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-400 text-sm text-center mt-8">
            No categories yet. Add your first one.
          </p>
        ) : (
          <ul className="space-y-2">
            {categories.map(cat => (
              <li
                key={cat.id}
                className="bg-white rounded-card p-4 flex items-center justify-between shadow-sm"
              >
                <div>
                  <p className="font-semibold text-brand-text">{cat.name}</p>
                  <p className="text-xs text-gray-400">Order: {cat.sort_order}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(cat)}
                    className="text-sm text-gray-500 px-3 py-1 rounded border border-gray-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="text-sm text-brand-accent px-3 py-1 rounded border border-brand-accent/30"
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
              {editTarget ? 'Edit Category' : 'New Category'}
            </h2>
            <label className="block mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</span>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-card px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                placeholder="e.g. Poppers"
                autoFocus
              />
            </label>
            <label className="block mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sort Order</span>
              <input
                type="number"
                value={form.sort_order}
                onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-card px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                min={1}
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
