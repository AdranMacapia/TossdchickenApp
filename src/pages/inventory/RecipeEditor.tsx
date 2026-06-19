import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { OwnerNav } from '../../components/OwnerNav'
import { costPerUsageUnit, calcUnitCost, type IngredientRow } from '../../lib/costing'

interface DbRecipe {
  id: string
  menu_item_id: string
  ingredient_id: string
  qty_used: number
}

interface Ingredient extends IngredientRow {
  name: string
}

export default function RecipeEditor() {
  const { itemId } = useParams<{ itemId: string }>()
  const [itemName, setItemName] = useState('')
  const [recipes, setRecipes] = useState<DbRecipe[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formIngredientId, setFormIngredientId] = useState('')
  const [formQty, setFormQty] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (itemId) load()
  }, [itemId])

  async function load() {
    setLoading(true)
    const [itemResult, recipesResult, ingredientsResult] = await Promise.all([
      supabase.from('menu_items').select('name').eq('id', itemId).single(),
      supabase.from('recipes').select('id, menu_item_id, ingredient_id, qty_used').eq('menu_item_id', itemId).order('id'),
      supabase.from('ingredients').select('id, name, purchase_price, purchase_qty, purchase_unit, usage_unit').order('name'),
    ])
    if (itemResult.data) setItemName(itemResult.data.name)
    if (!recipesResult.error) setRecipes(recipesResult.data ?? [])
    if (!ingredientsResult.error) setIngredients(ingredientsResult.data ?? [])
    if (recipesResult.error || ingredientsResult.error) setError('Failed to load data')
    setLoading(false)
  }

  const ingredientMap = new Map(ingredients.map(i => [i.id, i]))

  const totalCogs = calcUnitCost(
    recipes.map(r => ({ ingredient_id: r.ingredient_id, usage_qty: r.qty_used })),
    ingredients,
    0,
    true
  )

  const unusedIngredients = ingredients.filter(i => !recipes.some(r => r.ingredient_id === i.id))

  function openAddForm() {
    const first = unusedIngredients[0]
    setFormIngredientId(first?.id ?? '')
    setFormQty('')
    setError(null)
    setShowForm(true)
  }

  async function handleAdd() {
    const qty = parseFloat(formQty)
    if (!formIngredientId || isNaN(qty) || qty <= 0) {
      setError('Select an ingredient and enter a valid quantity.')
      return
    }
    setSaving(true)
    setError(null)
    const { error } = await supabase.from('recipes').insert({
      menu_item_id: itemId,
      ingredient_id: formIngredientId,
      qty_used: qty,
    })
    if (error) { setError('Failed to save'); setSaving(false); return }
    setShowForm(false)
    setSaving(false)
    await load()
  }

  async function handleRemove(recipe: DbRecipe) {
    const { error } = await supabase.from('recipes').delete().eq('id', recipe.id)
    if (error) setError('Failed to remove')
    else setRecipes(prev => prev.filter(r => r.id !== recipe.id))
  }

  const selectedIngredient = ingredients.find(i => i.id === formIngredientId)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <OwnerNav title={itemName ? `Recipe — ${itemName}` : 'Recipe'} backTo="/menu/items" />
      <div className="px-4 py-5 flex-1">
        {error && <p className="text-sm text-brand-accent mb-4 px-1">{error}</p>}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {recipes.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 text-sm">No ingredients in this recipe yet.</p>
              </div>
            ) : (
              <ul className="space-y-2 mb-4">
                {recipes.map((recipe, i) => {
                  const ing = ingredientMap.get(recipe.ingredient_id)
                  const lineCost = ing ? (() => { try { return costPerUsageUnit(ing) * recipe.qty_used } catch { return 0 } })() : 0
                  return (
                    <li
                      key={recipe.id}
                      className="bg-white border border-[#EAEAEA] rounded-[8px] p-4 flex items-center justify-between list-item-animate"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div>
                        <p className="font-semibold text-brand-text">{ing?.name ?? recipe.ingredient_id}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {recipe.qty_used} {ing?.usage_unit} · ₱{lineCost.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(recipe)}
                        className="text-sm text-brand-accent px-3 py-1 rounded-[6px] border border-brand-accent/30 hover:bg-brand-accent/5 transition-colors"
                      >
                        Remove
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}

            <div className="border-t border-[#EAEAEA] pt-4 mb-5 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-500">Total COGS</span>
              <span className="font-bold text-brand-text">₱{totalCogs.toFixed(2)}</span>
            </div>

            {unusedIngredients.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={openAddForm}
                  className="bg-brand-primary text-brand-text px-4 py-2 rounded-btn text-sm font-bold transition-transform active:scale-[0.98]"
                >
                  + Add Ingredient
                </button>
              </div>
            )}
          </>
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
            <h2 className="font-bold text-brand-text mb-5">Add Ingredient</h2>

            <label className="block mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ingredient</span>
              <select
                value={formIngredientId}
                onChange={e => setFormIngredientId(e.target.value)}
                className="mt-1.5 w-full border border-[#EAEAEA] rounded-[6px] px-3 py-2.5 text-sm focus:outline-none focus:border-brand-primary transition-colors"
              >
                {unusedIngredients.map(i => (
                  <option key={i.id} value={i.id}>{i.name} ({i.usage_unit})</option>
                ))}
              </select>
            </label>

            <label className="block mb-5">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Qty Used ({selectedIngredient?.usage_unit ?? '—'})
              </span>
              <input
                type="number"
                value={formQty}
                onChange={e => setFormQty(e.target.value)}
                className="mt-1.5 w-full border border-[#EAEAEA] rounded-[6px] px-3 py-2.5 text-sm focus:outline-none focus:border-brand-primary transition-colors"
                min={0.001}
                step={0.001}
                autoFocus
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
                onClick={handleAdd}
                disabled={saving || !formIngredientId || !formQty}
                className="flex-1 bg-brand-primary text-brand-text py-2.5 rounded-btn text-sm font-bold transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
