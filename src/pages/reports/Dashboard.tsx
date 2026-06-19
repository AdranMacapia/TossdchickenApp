import { useAnimatedNavigate } from '../../hooks/useAnimatedNavigate'

interface NavCard {
  label: string
  description: string
  to: string
}

const NAV_CARDS: NavCard[] = [
  { label: 'Menu', description: 'Categories, items, and flavors', to: '/menu/categories' },
  { label: 'Ingredients', description: 'Purchase prices and units', to: '/inventory/ingredients' },
  { label: 'Costing Sheet', description: 'Cost, price, and margin per item', to: '/costing' },
]

export default function Dashboard() {
  const navigate = useAnimatedNavigate()
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-white border-b border-[#EAEAEA] px-4 h-14 flex items-center gap-2.5 shrink-0">
        <span className="w-1 h-5 bg-brand-primary rounded-full" aria-hidden="true" />
        <h1 className="font-bold text-brand-text">Toss D' Chicken</h1>
      </header>
      <div className="px-4 py-5 flex-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Owner Tools</p>
        <ul className="space-y-2">
          {NAV_CARDS.map(card => (
            <li key={card.to}>
              <button
                onClick={() => navigate(card.to)}
                className="w-full text-left bg-white border border-[#EAEAEA] rounded-[8px] p-4 flex items-center justify-between hover:border-gray-300 transition-colors active:scale-[0.99]"
              >
                <div>
                  <p className="font-semibold text-brand-text">{card.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{card.description}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-300 mt-6">Expenses and P&amp;L reports coming in Phase 6.</p>
      </div>
    </div>
  )
}
