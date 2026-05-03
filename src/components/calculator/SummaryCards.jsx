import { TrendingUp, Wallet, PiggyBank, BarChart2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const cards = [
  {
    key: 'balanceFinal',
    label: 'Balance Final',
    labelMobile: 'Balance',
    icon: Wallet,
    description: 'Capital total al vencimiento',
    highlight: true,
  },
  {
    key: 'totalIntereses',
    label: 'Intereses Ganados',
    labelMobile: 'Intereses',
    icon: TrendingUp,
    description: 'Rendimientos generados',
  },
  {
    key: 'totalAbonos',
    label: 'Total Invertido',
    labelMobile: 'Invertido',
    icon: PiggyBank,
    description: 'Capital + abonos acumulados',
  },
  {
    key: 'roi',
    label: 'ROI',
    labelMobile: 'ROI',
    icon: BarChart2,
    description: 'Retorno sobre capital inicial',
    format: (v) => `${v.toFixed(2)}%`,
  },
]

export function SummaryCards({ resumen }) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 lg:gap-3">
      {cards.map(({ key, label, labelMobile, icon: Icon, description, format, highlight }) => {
        const value = resumen[key]
        const displayed = format ? format(value) : formatCurrency(value)

        return (
          <article
            key={key}
            className={`rounded-xl p-3 lg:p-4 border transition-all ${
              highlight
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-slate-800/60 border-slate-700/60'
            }`}
          >
            <div className="flex items-start justify-between mb-2 lg:mb-3">
              <p className="text-xs font-medium text-slate-400 leading-tight">
                <span className="sm:hidden">{labelMobile}</span>
                <span className="hidden sm:inline">{label}</span>
              </p>
              <div className={`p-1 lg:p-1.5 rounded-lg flex-shrink-0 ${highlight ? 'bg-emerald-500/20' : 'bg-slate-700/60'}`}>
                <Icon className={`w-3 h-3 lg:w-3.5 lg:h-3.5 ${highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
              </div>
            </div>
            <p className={`text-base lg:text-lg font-bold tabular-nums leading-tight truncate ${highlight ? 'text-emerald-300' : 'text-slate-100'}`}>
              {displayed}
            </p>
            <p className="text-xs text-slate-500 mt-1 hidden sm:block">{description}</p>
          </article>
        )
      })}
    </div>
  )
}
