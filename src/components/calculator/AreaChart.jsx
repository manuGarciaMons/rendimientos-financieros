import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  const order = ['Balance', 'Intereses acum.', 'Interés del mes']
  const sorted = [...payload].sort(
    (a, b) => order.indexOf(a.name) - order.indexOf(b.name)
  )

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl text-xs min-w-[200px]">
      <p className="text-slate-400 font-medium mb-2">Mes {label}</p>
      {sorted.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-300">{entry.name}</span>
          </span>
          <span className="font-semibold text-slate-100 tabular-nums">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function GrowthChart({ rows }) {
  const data = rows.map((r) => ({
    mes: r.mes,
    'Balance': r.balance,
    'Intereses acum.': r.totalInteresesAcumulados,
    'Interés del mes': r.interes,
  }))

  const leftFormatter = (v) => {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}k`
    return `$${v}`
  }

  const rightFormatter = (v) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}k`
    return `$${v}`
  }

  return (
    <div className="w-full h-64 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 60, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="gradBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradIntereses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="gradInteresMes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

          <XAxis
            dataKey="mes"
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            label={{ value: 'Mes', position: 'insideBottomRight', offset: -4, fill: '#64748b', fontSize: 11 }}
          />

          <YAxis
            yAxisId="left"
            tickFormatter={leftFormatter}
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={56}
          />

          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={rightFormatter}
            tick={{ fill: '#d97706', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={56}
          />

          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '8px' }}
            iconType="circle"
            iconSize={8}
          />

          <Area
            yAxisId="left"
            type="monotone"
            dataKey="Balance"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#gradBalance)"
            isAnimationActive={false}
            dot={false}
            activeDot={{ r: 4, fill: '#10b981', stroke: '#0f172a', strokeWidth: 2 }}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="Intereses acum."
            stroke="#34d399"
            strokeWidth={1.5}
            fill="url(#gradIntereses)"
            strokeDasharray="4 2"
            isAnimationActive={false}
            dot={false}
            activeDot={{ r: 3, fill: '#34d399', stroke: '#0f172a', strokeWidth: 2 }}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="Interés del mes"
            stroke="#f59e0b"
            strokeWidth={1.5}
            fill="url(#gradInteresMes)"
            strokeDasharray="2 3"
            isAnimationActive={false}
            dot={false}
            activeDot={{ r: 3, fill: '#f59e0b', stroke: '#0f172a', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
