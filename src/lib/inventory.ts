import { supabase } from './supabase'
import type { CartItem } from '../context/CartContext'

interface RecipeRow {
  menu_item_id: string
  ingredient_id: string
  qty_used: number
}

interface CartDeductionItem {
  menuItemId: string
  quantity: number
}

export function buildDeductions(
  recipes: RecipeRow[],
  cartItems: CartDeductionItem[]
): Map<string, number> {
  const deductions = new Map<string, number>()
  for (const cartItem of cartItems) {
    const itemRecipes = recipes.filter(r => r.menu_item_id === cartItem.menuItemId)
    for (const recipe of itemRecipes) {
      const current = deductions.get(recipe.ingredient_id) ?? 0
      deductions.set(recipe.ingredient_id, current + recipe.qty_used * cartItem.quantity)
    }
  }
  return deductions
}

export async function deductRecipeIngredients(
  orderId: string,
  cartItems: CartItem[]
): Promise<void> {
  const menuItemIds = [...new Set(cartItems.map(i => i.menuItemId))]

  const { data: recipes, error: recipesError } = await supabase
    .from('recipes')
    .select('menu_item_id, ingredient_id, qty_used')
    .in('menu_item_id', menuItemIds)

  if (recipesError) throw recipesError
  if (!recipes?.length) return

  const deductions = buildDeductions(recipes, cartItems)
  if (deductions.size === 0) return

  const ingredientIds = [...deductions.keys()]
  const { data: ings, error: ingsError } = await supabase
    .from('ingredients')
    .select('id, current_stock')
    .in('id', ingredientIds)

  if (ingsError) throw ingsError

  const stockMap = new Map((ings ?? []).map(i => [i.id, i.current_stock as number]))

  for (const [ingredientId, deductQty] of deductions) {
    if (!stockMap.has(ingredientId)) continue
    const currentStock = stockMap.get(ingredientId)!
    const newStock = Math.max(0, currentStock - deductQty)
    const { error: updateError } = await supabase
      .from('ingredients')
      .update({ current_stock: newStock })
      .eq('id', ingredientId)
    if (updateError) throw updateError
  }

  const logRows = [...deductions.entries()].map(([ingredientId, deductQty]) => ({
    ingredient_id: ingredientId,
    change_qty: -deductQty,
    reason: 'order',
    reference_id: orderId,
  }))

  const { error: logError } = await supabase.from('inventory_log').insert(logRows)
  if (logError) throw logError
}
