import { useState } from 'react'
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 12

function getMesLabel(mes, fechaInicio) {
  if (!fechaInicio) return mes
  const [year, month] = fechaInicio.split('-').map(Number)
  const date = new Date(year, month - 1 + (mes - 1), 1)
  return date.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' })
}

// Columnas: mobile muestra solo Mes, Interés, Balance
const COLS = [
  { key: 'mes',        label: 'Mes',          mobileHide: false },
  { key: 'abono',      label: 'Abono',         mobileHide: true  },
  { key: 'abonoUnico', label: 'Abono único',   mobileHide: true  },
  { key: 'interes',    label: 'Interés',       mobileHide: false },
  { key: 'balance',    label: 'Balance',       mobileHide: false },
  { key: 'acum',       label: 'Interés acum.', mobileHide: true  },
]

export function BreakdownTable({ rows, fechaInicio }) {
  const [expanded, setExpanded] = useState(true)
  const [page, setPage] = useState(0)

  const totalPages = Math.ceil(rows.length / PAGE_SIZE)
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <section className="rounded-xl border border-slate-800 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 lg:px-5 py-3 lg:py-3.5 bg-slate-800/60 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
        aria-expanded={expanded}
        aria-controls="breakdown-table"
      >
        <h2 className="text-sm font-semibold text-slate-200">Desglose mes a mes</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{rows.length} meses</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {expanded && (
        <div id="breakdown-table">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-xs" role="table" aria-label="Desglose de rendimientos mes a mes">
              <thead>
                <tr className="border-b border-slate-800">
                  {COLS.map((col) => (
                    <th
                      key={col.key}
                      scope="col"
                      className={cn(
                        'px-3 lg:px-4 py-2.5 lg:py-3 text-left text-slate-500 font-medium tracking-wide whitespace-nowrap',
                        col.mobileHide && 'hidden sm:table-cell'
                      )}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, i) => (
                  <tr
                    key={row.mes}
                    className={cn(
                      'border-b border-slate-800/50 transition-colors hover:bg-slate-800/40',
                      i % 2 === 0 ? 'bg-transparent' : 'bg-slate-900/30'
                    )}
                  >
                    <td className="px-3 lg:px-4 py-2 lg:py-2.5 font-medium text-slate-400">
                      {fechaInicio ? (
                        <span className="hidden sm:block capitalize">{getMesLabel(row.mes, fechaInicio)}</span>
                      ) : null}
                      <span className={cn('tabular-nums', fechaInicio && 'sm:hidden')}>{row.mes}</span>
                    </td>
                    <td className="px-3 lg:px-4 py-2 lg:py-2.5 tabular-nums hidden sm:table-cell">
                      {row.abonoMensual > 0 ? (
                        <span className={row.esReal ? 'text-blue-400 font-medium' : 'text-slate-300'}>
                          {formatCurrency(row.abonoMensual)}
                          {row.esReal && <span className="ml-1 text-blue-500 text-[10px]" title="Aporte real registrado">●</span>}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-3 lg:px-4 py-2 lg:py-2.5 tabular-nums hidden sm:table-cell">
                      {row.abonoUnico > 0
                        ? <span className="text-amber-400 font-semibold">{formatCurrency(row.abonoUnico)}</span>
                        : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-3 lg:px-4 py-2 lg:py-2.5 text-emerald-400 tabular-nums font-medium">
                      {formatCurrency(row.interes)}
                    </td>
                    <td className="px-3 lg:px-4 py-2 lg:py-2.5 text-slate-100 tabular-nums font-semibold">
                      {formatCurrency(row.balance)}
                    </td>
                    <td className="px-3 lg:px-4 py-2 lg:py-2.5 text-emerald-500/70 tabular-nums hidden sm:table-cell">
                      {formatCurrency(row.totalInteresesAcumulados)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between px-3 lg:px-4 py-3 border-t border-slate-800 bg-slate-900/50"
              role="navigation"
              aria-label="Paginación de la tabla"
            >
              <span className="text-xs text-slate-500">
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, rows.length)} de {rows.length}
              </span>
              <div className="flex items-center gap-1">
                <PageBtn onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} aria-label="Anterior">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </PageBtn>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PageBtn
                    key={i}
                    onClick={() => setPage(i)}
                    active={i === page}
                    aria-label={`Página ${i + 1}`}
                    aria-current={i === page ? 'page' : undefined}
                  >
                    {i + 1}
                  </PageBtn>
                ))}
                <PageBtn onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} aria-label="Siguiente">
                  <ChevronRight className="w-3.5 h-3.5" />
                </PageBtn>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function PageBtn({ children, onClick, disabled, active, ...props }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'min-w-[32px] h-8 px-1.5 rounded text-xs font-medium transition-all',
        'focus:outline-none focus:ring-1 focus:ring-emerald-500',
        active ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200',
        disabled && 'opacity-30 cursor-not-allowed'
      )}
      {...props}
    >
      {children}
    </button>
  )
}
