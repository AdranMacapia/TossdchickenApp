interface PriceTagProps {
  price: number
  cost?: number
  marginTarget?: number
}

export function PriceTag({ price, cost, marginTarget = 0.65 }: PriceTagProps) {
  const formatted = '₱' + price.toLocaleString('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const isBelowMargin =
    cost !== undefined && price > 0 && (price - cost) / price < marginTarget

  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-bold text-brand-primary text-sm">{formatted}</span>
      {isBelowMargin && (
        <span className="text-xs text-orange-500 font-medium">below margin</span>
      )}
    </span>
  )
}
