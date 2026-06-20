import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { OwnerNav } from '../../components/OwnerNav'
import type { Flavor } from '../../hooks/useMenuData'

interface FormState {
  name: string
  price_surcharge: string
  flavor_cost: string
}

export default function Flavors() {
  const { itemId } = useParams<{ itemId: string }>()
  const [itemName, setItemName] = useState('')
  const [flavors, setFlavors] = useState<Flavor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Flavor | null>(null)
  const [form, setForm] = useState<FormState>({ name: '', price_surcharge: '0', flavor_cost: '0' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (itemId) load()
  }, [itemId])

  async function load() {
    setLoading(true)
    const [itemResult, flavorsResult] = await Promise.all([
      supabase.from('menu_items').select('name').eq('id', itemId).single(),
      supabase.from('flavors').select('*').eq('menu_item_id', itemId).order('name'),
    ])
    if (!itemResult.error && itemResult.data) setItemName(itemResult.data.name)
    if (flavorsResult.error) {
      setError('Failed to load flavors')
    } else {
      setFlavors(flavorsResult.data ?? [])
    }
    setLoading(false)
  }

  function openAdd() {
    setEditTarget(null)
    setForm({ name: '', price_surcharge: '0', flavor_cost: '0' })
    setError(null)
    setShowForm(true)
  }

  function openEdit(flavor: Flavor) {
    setEditTarget(flavor)
    setForm({
      name: flavor.name,
      price_surcharge: String(flavor.price_surcharge),
      flavor_cost: String(flavor.flavor_cost),
    })
    setError(null)
    setShowForm(true)
  }

  async function handleSave() {
    const name = form.name.trim()
    if (!name) { setError('Name is required'); return }
    const price_surcharge = parseFloat(form.price_surcharge) || 0
    const flavor_cost = parseFloat(form.flavor_cost) || 0
    setSaving(true)
    setError(null)

    const payload = { name, price_surcharge, flavor_cost }
    const { error } = editTarget
      ? await supabase.from('flavors').update(payload).eq('id', editTarget.id)
      : await supabase.from('flavors').insert({ ...payload, menu_item_id: itemId })

    if (error) {
      setError('Failed to save')
      setSaving(false)
      return
    }
    setShowForm(false)
    setSaving(false)
    await load()
  }

  async function handleDelete(flavor: Flavor) {
    const { error } = await supabase.from('flavors').delete().eq('id', flavor.id)
    if (error) setError('Failed to delete')
    else setFlavors(prev => prev.filter(f => f.id !== flavor.id))
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <OwnerNav title={`Flavors — ${itemName}`} backTo="/menu/items" />

      <div className="px-4 py-4 flex-1">
        <div className="flex justify-end mb-4">
          <button
            onClick={openAdd}
            className="bg-brand-primary text-brand-text px-4 py-2 rounded-btn text-sm font-bold"
          >
            + Add Flavor
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {loading ? (
          <p className="text-gray-400 text-sm">Loading…</p>
        ) : flavors.length === 0 ? (
          <p className="text-gray-400 text-sm text-center mt-8">No flavors yet.</p>
        ) : (
          <ul className="space-y-2">
            {flavors.map(flavor => (
              <li
                key={flavor.id}
                className="bg-white rounded-card p-4 shadow-sm flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-brand-text">{flavor.name}</p>
                  <p className="text-xs text-gray-400">
                    Surcharge: {flavor.price_surcharge > 0 ? `+₱${flavor.price_surcharge}` : '—'}
                    {' · '}Cost: ₱{flavor.flavor_cost.toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(flavor)}
                    className="text-sm text-gray-500 px-3 py-1 rounded border border-gray-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(flavor)}
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
              {editTarget ? 'Edit Flavor' : 'New Flavor'}
            </h2>
            <label className="block mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Flavor Name</span>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-card px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                placeholder="e.g. Honey Garlic"
                autoFocus
              />
            </label>
            <label className="block mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price Surcharge (₱)</span>
              <input
                type="number"
                value={form.price_surcharge}
                onChange={e => setForm(f => ({ ...f, price_surcharge: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-card px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                min={0}
                step={1}
              />
            </label>
            <label className="block mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Flavor Cost (₱)</span>
              <input
                type="number"
                value={form.flavor_cost}
                onChange={e => setForm(f => ({ ...f, flavor_cost: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-card px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                min={0}
                step={0.01}
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
