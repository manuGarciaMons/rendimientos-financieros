import { useState, useCallback, useEffect } from 'react'
import { SlidersHorizontal, BarChart2 } from 'lucide-react'
import { InputPanel } from '@/components/calculator/InputPanel'
import { SummaryCards } from '@/components/calculator/SummaryCards'
import { GrowthChart } from '@/components/calculator/AreaChart'
import { BreakdownTable } from '@/components/calculator/BreakdownTable'
import { PinScreen } from '@/components/auth/PinScreen'
import { useCalculator } from '@/hooks/useCalculator'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'rendimientos-data'

const DEFAULT_PARAMS = {
  capitalInicial: 5000000,
  tasaMensual: 0.776,
  plazoMeses: 24,
  abonoMensual: 500000,
  abonosUnicos: [],
  fechaInicio: '',
}

function loadParams() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PARAMS
    return { ...DEFAULT_PARAMS, ...JSON.parse(raw).params }
  } catch {
    return DEFAULT_PARAMS
  }
}

function loadAportes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw).aportes || []
  } catch {
    return []
  }
}

export default function App() {
  const [unlocked, setUnlocked] = useState(false)
  const [mobileTab, setMobileTab] = useState('resultados')
  const [params, setParams] = useState(loadParams)
  const [aportes, setAportes] = useState(loadAportes)

  useEffect(() => {
    if (!unlocked) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ params, aportes }))
  }, [params, aportes, unlocked])

  const handleChange = useCallback((key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }))
  }, [])

  function handleLock() {
    setUnlocked(false)
  }

  function handleExport() {
    const data = { params, aportes, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rendimientos-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function handleImport(data) {
    if (data.params) setParams({ ...DEFAULT_PARAMS, ...data.params })
    if (data.aportes) setAportes(data.aportes)
  }

  const { rows, resumen } = useCalculator({ ...params, aportes })

  if (!unlocked) {
    return <PinScreen onUnlock={() => setUnlocked(true)} />
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950">

      {/* Sidebar */}
      <div className={cn(
        'w-full lg:w-80 xl:w-96 flex-shrink-0',
        mobileTab === 'configurar' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
      )}>
        <InputPanel
          params={params}
          onChange={handleChange}
          onResultados={() => setMobileTab('resultados')}
          aportes={aportes}
          onAportesChange={setAportes}
          onLock={handleLock}
          onExport={handleExport}
          onImport={handleImport}
        />
      </div>

      {/* Main */}
      <main className={cn(
        'flex-1 flex flex-col overflow-hidden',
        mobileTab === 'configurar' ? 'hidden lg:flex' : 'flex'
      )}>
        <header className="px-4 py-3 lg:px-5 lg:py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-slate-200">Proyección de rendimientos</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {params.plazoMeses} meses · {params.tasaMensual}% E.M.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Tiempo real
          </span>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 lg:p-5 space-y-3 lg:space-y-5 pb-20 lg:pb-5">
          <SummaryCards resumen={resumen} />

          <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 lg:p-5">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h2 className="text-sm font-semibold text-slate-200">Crecimiento del capital</h2>
              <span className="text-xs text-slate-500 hidden sm:block">Interés compuesto mensual</span>
            </div>
            <GrowthChart rows={rows} />
          </section>

          <BreakdownTable rows={rows} fechaInicio={params.fechaInicio} />

          <p className="text-center text-xs text-slate-600 pb-2">
            Los cálculos son aproximados y no constituyen asesoría financiera.
          </p>
        </div>
      </main>

      {/* Tab bar mobile */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800"
        aria-label="Navegación principal"
      >
        <div className="flex relative">
          <span
            className="absolute top-0 h-0.5 bg-emerald-400 transition-all duration-200"
            style={{
              width: '50%',
              left: mobileTab === 'resultados' ? '0%' : '50%',
            }}
          />
          <button
            onClick={() => setMobileTab('resultados')}
            aria-pressed={mobileTab === 'resultados'}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors focus:outline-none',
              mobileTab === 'resultados' ? 'text-emerald-400' : 'text-slate-500'
            )}
          >
            <BarChart2 className="w-5 h-5" />
            Resultados
          </button>
          <button
            onClick={() => setMobileTab('configurar')}
            aria-pressed={mobileTab === 'configurar'}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors focus:outline-none',
              mobileTab === 'configurar' ? 'text-emerald-400' : 'text-slate-500'
            )}
          >
            <SlidersHorizontal className="w-5 h-5" />
            Configurar
          </button>
        </div>
      </nav>
    </div>
  )
}
