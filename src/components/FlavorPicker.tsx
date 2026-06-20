import { useState } from 'react'
import type { MenuItem, Flavor } from '../hooks/useMenuData'
import type { SelectedFlavor } from '../context/CartContext'
import { NumericKeypad } from './NumericKeypad'

interface FlavorPickerResult {
  selectedFlavors: SelectedFlavor[]
  quantity: number
  isDrizzled: boolean
}

interface FlavorPickerProps {
  item: MenuItem
  flavors: Flavor[]
  onConfirm: (result: FlavorPickerResult) => void
  onClose: () => void
}

export function FlavorPicker({ item, flavors, onConfirm, onClose }: FlavorPickerProps) {
  const [selectedFlavors, setSelectedFlavors] = useState<SelectedFlavor[]>([])
  const [isDrizzled, setIsDrizzled] = useState(true)
  const [qty, setQty] = useState(1)

  const itemFlavors = flavors.filter(f => f.menu_item_id === item.id)
  const DIPPING_SAUCES = new Set(['Ranch', 'Cheddar'])
  const hasDippingSauce = selectedFlavors.some(f => DIPPING_SAUCES.has(f.name))
  const unitPrice = item.base_price + selectedFlavors.reduce((sum, f) => sum + f.surcharge, 0)
  const isConfirmDisabled = itemFlavors.length > 0 && selectedFlavors.length === 0

  function toggleFlavor(flavor: Flavor) {
    const alreadySelected = selectedFlavors.find(f => f.id === flavor.id)
    let nextFlavors: SelectedFlavor[]
    if (alreadySelected) {
      nextFlavors = selectedFlavors.filter(f => f.id !== flavor.id)
    } else {
      const next: SelectedFlavor = { id: flavor.id, name: flavor.name, surcharge: flavor.price_surcharge }
      if (selectedFlavors.length >= item.max_flavors) {
        nextFlavors = [...selectedFlavors.slice(1), next]
      } else {
        nextFlavors = [...selectedFlavors, next]
      }
    }
    setSelectedFlavors(nextFlavors)
    if (!nextFlavors.some(f => DIPPING_SAUCES.has(f.name))) {
      setIsDrizzled(true)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-base font-bold text-brand-text">{item.name}</h2>
        <p className="text-sm text-gray-400 mb-4">
          Base ₱{item.base_price.toFixed(2)}
          {item.max_flavors > 1 && ` · Pick up to ${item.max_flavors} flavors`}
        </p>

        {itemFlavors.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Flavor
            </p>
            <div className="grid grid-cols-2 gap-2">
              {itemFlavors.map(flavor => {
                const isSelected = selectedFlavors.some(f => f.id === flavor.id)
                return (
                  <button
                    key={flavor.id}
                    onClick={() => toggleFlavor(flavor)}
                    className={`p-3 rounded-card text-sm font-medium border-2 text-left transition-colors ${
                      isSelected
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                        : 'border-gray-200 text-brand-text'
                    }`}
                  >
                    <span className="block">{flavor.name}</span>
                    {flavor.price_surcharge > 0 && (
                      <span className="text-xs text-gray-400">+₱{flavor.price_surcharge}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {hasDippingSauce && (
          <div className="flex items-center justify-between mb-4 p-3 bg-amber-50 rounded-card">
            <div>
              <p className="text-sm font-medium text-brand-text">Drizzled on food?</p>
              <p className="text-xs text-gray-500">No = sauce in cup (+₱1 cost only)</p>
            </div>
            <button
              onClick={() => setIsDrizzled(prev => !prev)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                isDrizzled ? 'bg-brand-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  isDrizzled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}

        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Quantity
          </p>
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-3xl font-bold text-brand-text">{qty}</span>
            <span className="text-sm text-gray-500">
              × ₱{unitPrice.toFixed(2)} = ₱{(unitPrice * qty).toFixed(2)}
            </span>
          </div>
          <NumericKeypad value={qty} onChange={v => setQty(Math.max(1, v))} max={99} />
        </div>

        <button
          onClick={() => onConfirm({ selectedFlavors, quantity: qty, isDrizzled })}
          disabled={isConfirmDisabled}
          className="w-full bg-brand-primary text-white py-3 rounded-btn font-bold disabled:opacity-40"
        >
          Add to Order · ₱{(unitPrice * qty).toFixed(2)}
        </button>
      </div>
    </div>
  )
}
