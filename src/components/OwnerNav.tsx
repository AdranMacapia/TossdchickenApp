import { useNavigate } from 'react-router-dom'

interface OwnerNavProps {
  title: string
  backTo?: string
}

export function OwnerNav({ title, backTo }: OwnerNavProps) {
  const navigate = useNavigate()
  return (
    <header className="bg-white border-b border-gray-100 px-4 h-14 flex items-center gap-3 shrink-0">
      <button
        onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
        className="text-brand-text font-bold text-xl leading-none"
        aria-label="Go back"
      >
        ←
      </button>
      <h1 className="font-bold text-brand-text flex-1 truncate">{title}</h1>
    </header>
  )
}
