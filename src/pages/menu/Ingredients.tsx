import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { OwnerNav } from '../../components/OwnerNav'
import { costPerUsageUnit } from '../../lib/costing'

interface Ingredient {
  id: string
  name: string
  purchase_unit: string
  purchase_qty: number
  purchase_price: number
  usage_unit: string
  current_stock: number
  low_stock_threshold: number
}

const UNIT_FAMILIES: Record<string, string[]> = {
  g: ['g', 'kg'], kg: ['g', 'kg'],
  ml: ['ml', 'L'], L: ['ml', 'L'],
  piece: ['piece'],
}
const ALL_PURCHASE_UNITS = ['g', 'kg', 'ml', 'L', 'piece']

interface FormState {
  name: string
  purchase_unit: string
  purchase_qty: string
  purchase_price: string
  usage_unit: string
}

const BLANK_FORM: FormState = {
  name: '', purchase_unit: 'kg', purchase_qty: '1', purchase_price: '', usage_unit: 'g',
}

export default function Ingredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Ingredient | null>(null)
  const [form, setForm] = useState<FormState>(BLANK_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from('ingredients').select('*').order('name')
    if (error) setError('Failed to load ingredients')
    else setIngredients(data ?? [])
    setLoading(false)
  }

  function openAdd() {
    setEditTarget(null)
    setForm(BLANK_FORM)
    setError(null)
    setShowForm(true)
  }

  function openEdit(ing: Ingredient) {
    setEditTarget(ing)
    setForm({
      name: ing.name,
      purchase_unit: ing.purchase_unit,
      purchase_qty: String(ing.purchase_qty),
      purchase_price: String(ing.purchase_price),
      usage_unit: ing.usage_unit,
    })
    setError(null)
    setShowForm(true)
  }

  function onPurchaseUnitChange(unit: string) {
    const options = UNIT_FAMILIES[unit] ?? [unit]
    setForm(f => ({ ...f, purchase_unit: unit, usage_unit: options[0] }))
  }

  async function handleSave() {
    const name = form.name.trim()
    const purchase_qty = parseFloat(form.purchase_qty)
    const purchase_price = parseFloat(form.purchase_price)
    if (!name || isNaN(purchase_qty) || purchase_qty <= 0 || isNaN(purchase_price) || purchase_price < 0) {
      setError('Name, quantity, and price are required.')
      return
    }
    setSaving(true)
    setError(null)
    const payload = {
      name,
      purchase_unit: form.purchase_unit,
      purchase_qty,
      purchase_price,
      usage_unit: form.usage_unit,
    }
    const { error } = editTarget
      ? await supabase.from('ingredients').update(payload).eq('id', editTarget.id)
      : await supabase.from('ingredients').insert({ ...payload, current_stock: 0, low_stock_threshold: 0 })
    if (error) { setError('Failed to save'); setSaving(false); return }
    setShowForm(false)
    setSaving(false)
    await load()
  }

  async function handleDelete(ing: Ingredient) {
    const { error } = await supabase.from('ingredients').delete().eq('id', ing.id)
    if (error) setError('Failed to delete')
    else setIngredients(prev => prev.filter(i => i.id !== ing.id))
  }

  const usageOptions = UNIT_FAMILIES[form.purchase_unit] ?? [form.purchase_unit]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <OwnerNav title="Ingredients" backTo="/reports/dashboard" />
      <div className="px-4 py-5 flex-1">
        <div className="flex justify-end mb-5">
          <button
            onClick={openAdd}
            className="bg-brand-primary text-brand-text px-4 py-2 rounded-btn text-sm font-bold transition-transform active:scale-[0.98]"
          >
            + Add Ingredient
          </button>
        </div>

        {error && <p className="text-sm text-brand-accent mb-4 px-1">{error}</p>}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
          </div>
        ) : ingredients.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No ingredients yet.</p>
            <p className="text-gray-300 text-xs mt-1">Add the first one above.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {ingredients.map((ing, i) => (
              <li
                key={ing.id}
                className="bg-white border border-[#EAEAEA] rounded-[8px] p-4 flex items-center justify-between list-item-animate"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div>
                  <p className="font-semibold text-brand-text">{ing.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    ₱{ing.purchase_price.toFixed(2)} / {ing.purchase_qty}{ing.purchase_unit}
                    {' · '}₱{costPerUsageUnit(ing).toFixed(4)}/{ing.usage_unit}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(ing)}
                    className="text-sm text-gray-500 px-3 py-1 rounded-[6px] border border-[#EAEAEA] hover:border-gray-300 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(ing)}
                    className="text-sm text-brand-accent px-3 py-1 rounded-[6px] border border-brand-accent/30 hover:bg-brand-accent/5 transition-colors"
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
              {editTarget ? 'Edit Ingredient' : 'New Ingredient'}
            </h2>

            <label className="block mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</span>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="mt-1.5 w-full border border-[#EAEAEA] rounded-[6px] px-3 py-2.5 text-sm focus:outline-none focus:border-brand-primary transition-colors"
                placeholder="e.g. Cooking Oil"
                autoFocus
              />
            </label>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <label className="block">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Purchase Unit</span>
                <select
                  value={form.purchase_unit}
                  onChange={e => onPurchaseUnitChange(e.target.value)}
                  className="mt-1.5 w-full border border-[#EAEAEA] rounded-[6px] px-3 py-2.5 text-sm focus:outline-none focus:border-brand-primary transition-colors"
                >
                  {ALL_PURCHASE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Usage Unit</span>
                <select
                  value={form.usage_unit}
                  onChange={e => setForm(f => ({ ...f, usage_unit: e.target.value }))}
                  className="mt-1.5 w-full border border-[#EAEAEA] rounded-[6px] px-3 py-2.5 text-sm focus:outline-none focus:border-brand-primary transition-colors"
                >
                  {usageOptions.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <label className="block">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Qty Purchased</span>
                <input
                  type="number"
                  value={form.purchase_qty}
                  onChange={e => setForm(f => ({ ...f, purchase_qty: e.target.value }))}
                  className="mt-1.5 w-full border border-[#EAEAEA] rounded-[6px] px-3 py-2.5 text-sm focus:outline-none focus:border-brand-primary transition-colors"
                  min={0.001}
                  step={0.001}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price (₱)</span>
                <input
                  type="number"
                  value={form.purchase_price}
                  onChange={e => setForm(f => ({ ...f, purchase_price: e.target.value }))}
                  className="mt-1.5 w-full border border-[#EAEAEA] rounded-[6px] px-3 py-2.5 text-sm focus:outline-none focus:border-brand-primary transition-colors"
                  min={0}
                  step={0.01}
                />
              </label>
            </div>

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
