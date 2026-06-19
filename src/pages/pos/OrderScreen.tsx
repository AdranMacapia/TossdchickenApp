import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { useMenuData } from '../../hooks/useMenuData'
import { CategoryTabBar } from '../../components/CategoryTabBar'
import { FlavorPicker } from '../../components/FlavorPicker'
import { useAuth } from '../../context/AuthContext'
import { useAnimatedNavigate } from '../../hooks/useAnimatedNavigate'
import { supabase } from '../../lib/supabase'
import { deductRecipeIngredients } from '../../lib/inventory'
import type { MenuItem } from '../../hooks/useMenuData'
import type { SelectedFlavor } from '../../context/CartContext'

export default function OrderScreen() {
  const { user } = useAuth()
  const navigate = useAnimatedNavigate()
  const { categories, items, flavors, loading } = useMenuData()
  const {
    items: cartItems, orderType, total,
    addItem, removeItem, updateQty, setOrderType, clearCart,
  } = useCart()

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [pickerItem, setPickerItem] = useState<MenuItem | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const filteredItems = selectedCategoryId
    ? items.filter(i => i.category_id === selectedCategoryId)
    : items

  const cartQty = cartItems.reduce((n, i) => n + i.quantity, 0)

  function handleItemTap(item: MenuItem) {
    const itemFlavors = flavors.filter(f => f.menu_item_id === item.id)
    if (itemFlavors.length === 0) {
      addItem({
        menuItemId: item.id,
        menuItemName: item.name,
        selectedFlavors: [],
        quantity: 1,
        unitPrice: item.base_price,
        isDrizzled: true,
      })
    } else {
      setPickerItem(item)
    }
  }

  function handleFlavorConfirm(result: {
    selectedFlavors: SelectedFlavor[]
    quantity: number
    isDrizzled: boolean
  }) {
    if (!pickerItem) return
    const unitPrice =
      pickerItem.base_price + result.selectedFlavors.reduce((sum, f) => sum + f.surcharge, 0)
    addItem({
      menuItemId: pickerItem.id,
      menuItemName: pickerItem.name,
      selectedFlavors: result.selectedFlavors,
      quantity: result.quantity,
      unitPrice,
      isDrizzled: result.isDrizzled,
    })
    setPickerItem(null)
  }

  async function deductPackaging(orderId: string) {
    const { data: pkgItems, error: pkgError } = await supabase
      .from('packaging_items')
      .select('ingredient_id, qty_per_order')

    if (pkgError) throw pkgError
    if (!pkgItems?.length) return

    const validPkgItems = pkgItems.filter(p => p.ingredient_id != null) as Array<{
      ingredient_id: string
      qty_per_order: number
    }>
    if (!validPkgItems.length) return

    const ingredientIds = validPkgItems.map(p => p.ingredient_id)
    const { data: ings, error: ingsError } = await supabase
      .from('ingredients')
      .select('id, current_stock')
      .in('id', ingredientIds)

    if (ingsError) throw ingsError

    const stockMap = new Map((ings ?? []).map(i => [i.id, i.current_stock as number]))

    for (const pkg of validPkgItems) {
      const currentStock = stockMap.get(pkg.ingredient_id) ?? 0
      const newStock = Math.max(0, currentStock - pkg.qty_per_order)
      const { error: updateError } = await supabase
        .from('ingredients')
        .update({ current_stock: newStock })
        .eq('id', pkg.ingredient_id)
      if (updateError) throw updateError
    }

    const logRows = validPkgItems.map(pkg => ({
      ingredient_id: pkg.ingredient_id,
      change_qty: -pkg.qty_per_order,
      reason: 'packaging_takeout',
      reference_id: orderId,
    }))
    const { error: logError } = await supabase.from('inventory_log').insert(logRows)
    if (logError) throw logError
  }

  async function handleCompleteOrder() {
    if (cartItems.length === 0 || submitting) return
    setCartOpen(false)
    setSubmitting(true)

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          cashier_id: user?.id,
          total,
          order_type: orderType,
          payment_type: 'cash',
        })
        .select('id, order_number')
        .single()

      if (orderError || !order) throw orderError ?? new Error('Order insert failed')

      const { error: itemsError } = await supabase.from('order_items').insert(
        cartItems.map(item => ({
          order_id: order.id,
          menu_item_id: item.menuItemId,
          flavor_id: item.selectedFlavors[0]?.id ?? null,
          qty: item.quantity,
          unit_price: item.unitPrice,
          unit_cost: 0,
          is_drizzled: item.isDrizzled,
          note: item.selectedFlavors.slice(1).map(f => f.name).join(', ') || null,
        }))
      )

      if (itemsError) throw itemsError

      if (orderType === 'takeout') {
        await deductPackaging(order.id)
      }

      await deductRecipeIngredients(order.id, cartItems)

      clearCart()
      navigate(`/pos/receipt/${order.id}`)
    } catch (err) {
      console.error('Order failed:', err)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#EAEAEA] px-4 py-3 shrink-0">
        <div className="flex items-center justify-between">
          {/* Order type toggle */}
          <div className="flex bg-gray-100 rounded-[8px] p-0.5 gap-0.5">
            <button
              onClick={() => setOrderType('takeout')}
              className={`px-3.5 py-1.5 rounded-[6px] text-sm font-semibold transition-colors ${
                orderType === 'takeout'
                  ? 'bg-brand-primary text-brand-text shadow-none'
                  : 'text-gray-500'
              }`}
            >
              Take Out
            </button>
            <button
              onClick={() => setOrderType('dine_in')}
              className={`px-3.5 py-1.5 rounded-[6px] text-sm font-semibold transition-colors ${
                orderType === 'dine_in'
                  ? 'bg-brand-primary text-brand-text shadow-none'
                  : 'text-gray-500'
              }`}
            >
              Dine In
            </button>
          </div>

          {/* Cart indicator */}
          {cartQty > 0 && (
            <button
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 bg-brand-primary text-brand-text px-3 py-1.5 rounded-btn text-sm font-bold transition-transform active:scale-[0.97]"
            >
              <span className="bg-brand-text text-brand-primary text-xs rounded-full w-5 h-5 flex items-center justify-center font-black">
                {cartQty}
              </span>
              <span>₱{total.toFixed(2)}</span>
            </button>
          )}
        </div>
      </header>

      {/* Category tabs */}
      <CategoryTabBar
        categories={categories}
        selectedId={selectedCategoryId}
        onSelect={setSelectedCategoryId}
      />

      {/* Menu grid */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No items in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleItemTap(item)}
                className="bg-white border border-[#EAEAEA] rounded-[8px] p-3.5 text-left transition-colors active:bg-gray-50"
              >
                <p className="text-sm font-semibold text-brand-text leading-snug">{item.name}</p>
                <p className="text-brand-primary font-black text-base mt-1.5">
                  ₱{item.base_price.toFixed(0)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Complete order bar */}
      {cartItems.length > 0 && (
        <div className="bg-white border-t border-[#EAEAEA] px-4 py-3 shrink-0">
          <button
            onClick={handleCompleteOrder}
            disabled={submitting}
            className="w-full bg-brand-primary text-brand-text py-3.5 rounded-btn font-bold text-base transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? 'Processing…' : `Complete Order · ₱${total.toFixed(2)}`}
          </button>
        </div>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setCartOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[12px] p-4 max-h-[75vh] flex flex-col modal-enter"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-base font-bold text-brand-text">Current Order</h3>
              <button
                onClick={() => setCartOpen(false)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors text-xl leading-none"
                aria-label="Close cart"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {cartItems.map(item => (
                <div
                  key={item.cartItemId}
                  className="flex items-start gap-3 py-3 border-b border-[#EAEAEA]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brand-text">{item.menuItemName}</p>
                    {item.selectedFlavors.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.selectedFlavors.map(f => f.name).join(' + ')}
                        {!item.isDrizzled && ' · not drizzled'}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        if (item.quantity <= 1) removeItem(item.cartItemId)
                        else updateQty(item.cartItemId, item.quantity - 1)
                      }}
                      className="w-7 h-7 rounded-full bg-gray-100 font-bold text-brand-text flex items-center justify-center text-lg leading-none"
                    >
                      −
                    </button>
                    <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.cartItemId, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-gray-100 font-bold text-brand-text flex items-center justify-center text-lg leading-none"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm font-bold text-brand-text w-16 text-right shrink-0">
                    ₱{(item.unitPrice * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="shrink-0 pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-brand-text">Total</p>
                <p className="text-2xl font-black text-brand-text">₱{total.toFixed(2)}</p>
              </div>
              <button
                onClick={handleCompleteOrder}
                disabled={submitting}
                className="w-full bg-brand-primary text-brand-text py-3.5 rounded-btn font-bold text-base transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? 'Processing…' : 'Complete Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flavor picker */}
      {pickerItem && (
        <FlavorPicker
          item={pickerItem}
          flavors={flavors}
          onConfirm={handleFlavorConfirm}
          onClose={() => setPickerItem(null)}
        />
      )}
    </div>
  )
}
