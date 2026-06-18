interface Category {
  id: string
  name: string
}

interface CategoryTabBarProps {
  categories: Category[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function CategoryTabBar({ categories, selectedId, onSelect }: CategoryTabBarProps) {
  const activeClass = 'bg-brand-primary text-white'
  const inactiveClass = 'bg-white text-brand-text border border-gray-200'

  return (
    <div className="flex overflow-x-auto gap-2 px-4 py-2 scrollbar-hide shrink-0">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 px-4 py-1.5 rounded-btn text-sm font-semibold transition-colors ${
          selectedId === null ? activeClass : inactiveClass
        }`}
      >
        All
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`shrink-0 px-4 py-1.5 rounded-btn text-sm font-semibold transition-colors ${
            selectedId === cat.id ? activeClass : inactiveClass
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
