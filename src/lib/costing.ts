const CONVERSION_FACTORS: Record<string, Record<string, number>> = {
  kg: { g: 1000, kg: 1 },
  g:  { kg: 0.001, g: 1 },
  L:  { ml: 1000, L: 1 },
  ml: { L: 0.001, ml: 1 },
}

function conversionFactor(fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) return 1
  const factor = CONVERSION_FACTORS[fromUnit]?.[toUnit]
  if (factor === undefined) {
    throw new Error(`No unit conversion: ${fromUnit} → ${toUnit}`)
  }
  return factor
}

export function costPerUsageUnit(ingredient: {
  purchase_price: number
  purchase_qty: number
  purchase_unit: string
  usage_unit: string
}): number {
  const factor = conversionFactor(ingredient.purchase_unit, ingredient.usage_unit)
  return ingredient.purchase_price / (ingredient.purchase_qty * factor)
}

export interface RecipeRow {
  ingredient_id: string
  usage_qty: number
}

export interface IngredientRow {
  id: string
  purchase_price: number
  purchase_qty: number
  purchase_unit: string
  usage_unit: string
}

export function calcUnitCost(
  recipes: RecipeRow[],
  ingredients: IngredientRow[],
  flavorCost: number,
  isDrizzled: boolean
): number {
  const ingredientMap = new Map(ingredients.map(i => [i.id, i]))

  const recipeCost = recipes.reduce((sum, row) => {
    const ing = ingredientMap.get(row.ingredient_id)
    if (!ing) return sum
    return sum + costPerUsageUnit(ing) * row.usage_qty
  }, 0)

  const drizzleCost = isDrizzled ? 0 : 1

  return recipeCost + flavorCost + drizzleCost
}

export const DEFAULT_MARGIN_TARGET = 0.65

export function suggestedPrice(cost: number, marginTarget: number): number {
  if (marginTarget >= 1) throw new RangeError('marginTarget must be less than 1')
  return cost / (1 - marginTarget)
}

export function isUnderMargin(price: number, cost: number, marginTarget: number): boolean {
  return price < suggestedPrice(cost, marginTarget)
}
