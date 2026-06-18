import { createContext, useContext, useState, type ReactNode } from 'react'

export type OrderType = 'takeout' | 'dine_in'

export interface SelectedFlavor {
  id: string
  name: string
  surcharge: number
}

export interface CartItem {
  cartItemId: string
  menuItemId: string
  menuItemName: string
  selectedFlavors: SelectedFlavor[]
  quantity: number
  unitPrice: number
  isDrizzled: boolean
}

interface CartContextValue {
  items: CartItem[]
  orderType: OrderType
  total: number
  addItem: (item: Omit<CartItem, 'cartItemId'>) => void
  removeItem: (cartItemId: string) => void
  updateQty: (cartItemId: string, qty: number) => void
  setOrderType: (type: OrderType) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [orderType, setOrderType] = useState<OrderType>('takeout')

  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  function addItem(item: Omit<CartItem, 'cartItemId'>) {
    const cartItemId = `cart-${Math.random().toString(36).slice(2)}`
    setItems(prev => [...prev, { ...item, cartItemId }])
  }

  function removeItem(cartItemId: string) {
    setItems(prev => prev.filter(i => i.cartItemId !== cartItemId))
  }

  function updateQty(cartItemId: string, qty: number) {
    setItems(prev =>
      prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: qty } : i)
    )
  }

  function clearCart() {
    setItems([])
  }

  return (
    <CartContext.Provider value={{
      items, orderType, total,
      addItem, removeItem, updateQty,
      setOrderType, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
