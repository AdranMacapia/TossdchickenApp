interface NumericKeypadProps {
  value: number
  onChange: (value: number) => void
  max?: number
}

export function NumericKeypad({ value, onChange, max = 99 }: NumericKeypadProps) {
  function handleDigit(digit: number) {
    onChange(Math.min(value * 10 + digit, max))
  }

  function handleBackspace() {
    onChange(Math.floor(value / 10))
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
        <button
          key={d}
          onClick={() => handleDigit(d)}
          aria-label={String(d)}
          className="h-14 rounded-card bg-gray-100 text-xl font-bold text-brand-text active:bg-gray-200"
        >
          {d}
        </button>
      ))}
      <div />
      <button
        onClick={() => handleDigit(0)}
        aria-label="0"
        className="h-14 rounded-card bg-gray-100 text-xl font-bold text-brand-text active:bg-gray-200"
      >
        0
      </button>
      <button
        onClick={handleBackspace}
        aria-label="backspace"
        className="h-14 rounded-card bg-gray-100 text-xl font-bold text-brand-text active:bg-gray-200"
      >
        ⌫
      </button>
    </div>
  )
}
