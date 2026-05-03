import { cn } from '@/lib/utils'

export function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix = '',
  suffix = '',
  formatDisplay,
  id,
}) {
  const display = formatDisplay ? formatDisplay(value) : `${prefix}${value.toLocaleString('es-MX')}${suffix}`

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
        </label>
        <span className="text-sm font-semibold text-emerald-400 tabular-nums">
          {display}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-700"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>{prefix}{min.toLocaleString('es-MX')}{suffix}</span>
        <span>{prefix}{max.toLocaleString('es-MX')}{suffix}</span>
      </div>
    </div>
  )
}

export function NumberInput({ label, value, onChange, min, max, step = 1, prefix = '', suffix = '', id }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-colors">
        {prefix && <span className="text-slate-400 text-sm select-none">{prefix}</span>}
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            if (!isNaN(v)) onChange(v)
          }}
          className={cn(
            "flex-1 bg-transparent text-slate-100 text-sm font-medium outline-none",
            "placeholder:text-slate-500 tabular-nums"
          )}
        />
        {suffix && <span className="text-slate-400 text-sm select-none">{suffix}</span>}
      </div>
    </div>
  )
}
