import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { OwnerNav } from '../../components/OwnerNav'
import { calcUnitCost, isUnderMargin, DEFAULT_MARGIN_TARGET, type IngredientRow } from '../../lib/costing'

interface MenuItem {
  id: string
  name: string
  base_price: number
}

interface Flavor {
  id: string
  menu_item_id: string
  name: string
  price_surcharge: number
  flavor_cost: number
}

interface DbRecipe {
  id: string
  menu_item_id: string
  ingredient_id: string
  qty_used: number
}

interface CostRow {
  key: string
  itemName: string
  flavorName: string
  price: number
  cost: number
  margin: number
  underMargin: boolean
}

export default function CostingSheet() {
  const [rows, setRows] = useState<CostRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [itemsResult, flavorsResult, recipesResult, ingredientsResult] = await Promise.all([
      supabase.from('menu_items').select('id, name, base_price').order('name'),
      supabase.from('flavors').select('id, menu_item_id, name, price_surcharge, flavor_cost').order('name'),
      supabase.from('recipes').select('id, menu_item_id, ingredient_id, qty_used').order('menu_item_id'),
      supabase.from('ingredients').select('id, purchase_price, purchase_qty, purchase_unit, usage_unit').order('name'),
    ])

    if (itemsResult.error || flavorsResult.error || recipesResult.error || ingredientsResult.error) {
      setError('Failed to load costing data')
      setLoading(false)
      return
    }

    const items: MenuItem[] = itemsResult.data ?? []
    const flavors: Flavor[] = flavorsResult.data ?? []
    const recipes: DbRecipe[] = recipesResult.data ?? []
    const ingredients: IngredientRow[] = ingredientsResult.data ?? []

    const computed: CostRow[] = []

    for (const item of items) {
      const itemRecipes = recipes
        .filter(r => r.menu_item_id === item.id)
        .map(r => ({ ingredient_id: r.ingredient_id, usage_qty: r.qty_used }))
      const itemFlavors = flavors.filter(f => f.menu_item_id === item.id)

      if (itemFlavors.length === 0) {
        const cost = calcUnitCost(itemRecipes, ingredients, 0, true)
        const price = item.base_price
        const margin = price > 0 ? (price - cost) / price : 0
        computed.push({
          key: `${item.id}-base`,
          itemName: item.name,
          flavorName: '—',
          price,
          cost,
          margin,
          underMargin: isUnderMargin(price, cost, DEFAULT_MARGIN_TARGET),
        })
      } else {
        for (const flavor of itemFlavors) {
          const cost = calcUnitCost(itemRecipes, ingredients, flavor.flavor_cost, true)
          const price = item.base_price + flavor.price_surcharge
          const margin = price > 0 ? (price - cost) / price : 0
          computed.push({
            key: `${item.id}-${flavor.id}`,
            itemName: item.name,
            flavorName: flavor.name,
            price,
            cost,
            margin,
            underMargin: isUnderMargin(price, cost, DEFAULT_MARGIN_TARGET),
          })
        }
      }
    }

    setRows(computed)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <OwnerNav title="Costing Sheet" backTo="/reports/dashboard" />
      <div className="px-4 py-5 flex-1">
        {error && <p className="text-sm text-brand-accent mb-4 px-1">{error}</p>}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No menu items found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#EAEAEA]">
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Item</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Flavor</th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cost</th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Margin</th>
                  <th className="text-center py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.key} className="border-b border-[#EAEAEA] hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-brand-text">{row.itemName}</td>
                    <td className="py-3 px-3 text-gray-500">{row.flavorName}</td>
                    <td className="py-3 px-3 text-right text-gray-600">₱{row.cost.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-medium text-brand-text">₱{row.price.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right text-gray-600">{(row.margin * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        row.underMargin
                          ? 'bg-brand-accent/10 text-brand-accent'
                          : 'bg-green-50 text-green-700'
                      }`}>
                        {row.underMargin ? 'Below' : 'OK'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-3 px-1">
              Target margin: {(DEFAULT_MARGIN_TARGET * 100).toFixed(0)}%. Items priced below the target show "Below".
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
