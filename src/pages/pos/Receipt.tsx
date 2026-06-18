import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface OrderItem {
  id: string
  qty: number
  unit_price: number
  is_drizzled: boolean
  note: string | null
  menu_items: { name: string }
  flavors: { name: string } | null
}

interface OrderData {
  id: string
  order_number: number
  created_at: string
  total: number
  order_type: 'takeout' | 'dine_in'
  order_items: OrderItem[]
}

export default function Receipt() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return
    supabase
      .from('orders')
      .select(`
        id, order_number, created_at, total, order_type,
        order_items (
          id, qty, unit_price, is_drizzled, note,
          menu_items ( name ),
          flavors ( name )
        )
      `)
      .eq('id', orderId)
      .single()
      .then(({ data }) => {
        setOrder(data as OrderData | null)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Failed to fetch receipt:', error)
        setLoading(false)
      })
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading receipt…</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-gray-500 text-sm">Receipt not found.</p>
        <Link to="/pos" className="text-brand-primary font-semibold text-sm">
          ← Back to POS
        </Link>
      </div>
    )
  }

  const date = new Date(order.created_at)
  const dateStr = date.toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
  const timeStr = date.toLocaleTimeString('en-PH', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4">
      {/* Receipt card — narrow thermal-paper style */}
      <div className="bg-white w-full max-w-xs shadow-md font-mono text-sm">
        {/* Header */}
        <div className="text-center border-b border-dashed border-gray-300 p-4">
          <p className="text-base font-bold text-brand-text">Toss D' Chicken</p>
          <p className="text-xs text-gray-400 mt-0.5">{dateStr} {timeStr}</p>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
            order.order_type === 'takeout'
              ? 'bg-brand-primary text-white'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {order.order_type === 'takeout' ? 'Take Out' : 'Dine In'}
          </span>
          <p className="text-xs text-gray-400 mt-1">Order #{order.order_number}</p>
        </div>

        {/* Line items */}
        <div className="p-4 border-b border-dashed border-gray-300 space-y-2">
          {order.order_items.map(item => {
            const flavorParts = [
              item.flavors?.name,
              item.note || null,
              !item.is_drizzled ? 'not drizzled' : null,
            ].filter(Boolean)

            return (
              <div key={item.id}>
                <div className="flex justify-between gap-2">
                  <span className="flex-1 leading-snug">
                    {item.qty}× {item.menu_items.name}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    ₱{(item.unit_price * item.qty).toFixed(2)}
                  </span>
                </div>
                {flavorParts.length > 0 && (
                  <p className="text-xs text-gray-400 pl-3">{flavorParts.join(' + ')}</p>
                )}
              </div>
            )
          })}
        </div>

        {/* Total */}
        <div className="p-4 border-b border-dashed border-gray-300">
          <div className="flex justify-between font-bold text-base">
            <span>TOTAL</span>
            <span className="tabular-nums">₱{order.total.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Cash</p>
        </div>

        {/* Footer */}
        <div className="text-center p-4 text-xs text-gray-400">
          Thank you!
        </div>
      </div>

      {/* New Order button */}
      <button
        onClick={() => navigate('/pos')}
        className="mt-6 bg-brand-primary text-white px-8 py-3 rounded-btn font-bold text-base"
      >
        New Order
      </button>
    </div>
  )
}
