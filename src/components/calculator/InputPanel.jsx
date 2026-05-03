import { useState, useEffect } from 'react'
import {
  PlusCircle, Trash2, TrendingUp, Calendar, DollarSign, Percent,
  BarChart2, Lock, Download, Upload, ClipboardList,
} from 'lucide-react'
import { SliderInput, NumberInput } from '@/components/ui/SliderInput'
import { cn } from '@/lib/utils'

function getCurrentMes(fechaInicio, plazoMeses) {
  const [startYear, startMonth] = fechaInicio.split('-').map(Number)
  const now = new Date()
  const mes = (now.getFullYear() - startYear) * 12 + (now.getMonth() + 1 - startMonth) + 1
  return Math.min(Math.max(1, mes), plazoMeses)
}

export function InputPanel({ params, onChange, onResultados, aportes, onAportesChange, onLock, onExport, onImport }) {
  const [nuevoAbono, setNuevoAbono] = useState({ mes: 1, monto: 1000 })
  const [nuevoAporte, setNuevoAporte] = useState({ mes: 1, monto: 0, nota: '' })

  // Auto-avanzar el mes actual cuando cambia la fecha de inicio
  useEffect(() => {
    if (params.fechaInicio) {
      const mes = getCurrentMes(params.fechaInicio, params.plazoMeses)
      setNuevoAporte(prev => ({ ...prev, mes }))
    }
  }, [params.fechaInicio, params.plazoMeses])

  const currentMes = params.fechaInicio ? getCurrentMes(params.fechaInicio, params.plazoMeses) : null

  function addAbonoUnico() {
    if (!nuevoAbono.monto || nuevoAbono.mes < 1 || nuevoAbono.mes > params.plazoMeses) return
    onChange('abonosUnicos', [
      ...params.abonosUnicos,
      { ...nuevoAbono, id: Date.now() },
    ])
    setNuevoAbono({ mes: 1, monto: 1000 })
  }

  function removeAbonoUnico(id) {
    onChange('abonosUnicos', params.abonosUnicos.filter((a) => a.id !== id))
  }

  function addAporte() {
    if (nuevoAporte.mes < 1 || nuevoAporte.mes > params.plazoMeses) return
    // Si ya existe un aporte para ese mes, reemplazarlo
    const existing = aportes.find((a) => a.mes === nuevoAporte.mes)
    if (existing) {
      onAportesChange(aportes.map((a) =>
        a.mes === nuevoAporte.mes ? { ...a, monto: nuevoAporte.monto, nota: nuevoAporte.nota } : a
      ))
    } else {
      onAportesChange([...aportes, { ...nuevoAporte, id: Date.now() }])
    }
    setNuevoAporte({ mes: 1, monto: 0, nota: '' })
  }

  function removeAporte(id) {
    onAportesChange(aportes.filter((a) => a.id !== id))
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        onImport(data)
      } catch {
        alert('Archivo inválido o formato incorrecto')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col min-h-screen lg:min-h-0">
      {/* Header */}
      <div className="p-4 lg:p-5 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100 leading-tight">
                Calculadora de Rendimientos
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">Interés compuesto con reinversión mensual</p>
            </div>
          </div>
          <button
            onClick={onLock}
            aria-label="Bloquear aplicación"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-slate-500 flex-shrink-0"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 lg:p-5 space-y-6 lg:space-y-7 pb-24 lg:pb-5">

        {/* Capital Inicial */}
        <Section icon={<DollarSign className="w-3.5 h-3.5" />} title="Capital Inicial">
          <SliderInput
            id="capital"
            label="Monto inicial"
            value={params.capitalInicial}
            onChange={(v) => onChange('capitalInicial', v)}
            min={100000}
            max={500000000}
            step={500000}
            prefix="$"
            formatDisplay={(v) => `$${v.toLocaleString('es-CO')}`}
          />
          <NumberInput
            id="capital-num"
            label="Valor exacto"
            value={params.capitalInicial}
            onChange={(v) => onChange('capitalInicial', Math.max(0, v))}
            min={0}
            step={100000}
            prefix="$"
          />
        </Section>

        {/* Tasa */}
        <Section icon={<Percent className="w-3.5 h-3.5" />} title="Tasa de Interés">
          <SliderInput
            id="tasa"
            label="Tasa mensual"
            value={params.tasaMensual}
            onChange={(v) => onChange('tasaMensual', parseFloat(v.toFixed(4)))}
            min={0.01}
            max={10}
            step={0.01}
            suffix="%"
            formatDisplay={(v) => `${v.toFixed(4).replace(/\.?0+$/, '')}%`}
          />
          <div className="grid grid-cols-2 gap-2">
            <NumberInput
              id="tasa-mensual-num"
              label="% Mensual (E.M.)"
              value={params.tasaMensual}
              onChange={(v) => {
                const val = Math.max(0.001, Math.min(10, v))
                onChange('tasaMensual', parseFloat(val.toFixed(6)))
              }}
              min={0.001}
              max={10}
              step={0.01}
              suffix="%"
            />
            <NumberInput
              id="tasa-ea-num"
              label="% Anual (E.A.)"
              value={parseFloat((((1 + params.tasaMensual / 100) ** 12 - 1) * 100).toFixed(4))}
              onChange={(v) => {
                const mensual = (Math.pow(1 + v / 100, 1 / 12) - 1) * 100
                onChange('tasaMensual', parseFloat(mensual.toFixed(6)))
              }}
              min={0.01}
              max={214}
              step={0.01}
              suffix="%"
            />
          </div>
          <div className="px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold">{params.tasaMensual.toFixed(4).replace(/\.?0+$/, '')}%</span> E.M.
              {' = '}
              <span className="text-emerald-400 font-semibold">
                {(((1 + params.tasaMensual / 100) ** 12 - 1) * 100).toFixed(2)}%
              </span>{' '}
              E.A.
            </p>
          </div>
        </Section>

        {/* Plazo */}
        <Section icon={<Calendar className="w-3.5 h-3.5" />} title="Plazo">
          <SliderInput
            id="plazo"
            label="Duración"
            value={params.plazoMeses}
            onChange={(v) => onChange('plazoMeses', v)}
            min={1}
            max={120}
            step={1}
            suffix=" meses"
            formatDisplay={(v) => `${v} ${v === 1 ? 'mes' : 'meses'}`}
          />
          <div className="space-y-1.5">
            <label htmlFor="fecha-inicio" className="block text-xs font-medium text-slate-400">
              Fecha de inicio <span className="text-slate-600">(opcional)</span>
            </label>
            <input
              id="fecha-inicio"
              type="date"
              value={params.fechaInicio || ''}
              onChange={(e) => onChange('fechaInicio', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-colors [color-scheme:dark]"
            />
            {params.fechaInicio && (
              <button
                type="button"
                onClick={() => onChange('fechaInicio', '')}
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
              >
                Quitar fecha
              </button>
            )}
          </div>
        </Section>

        {/* Abono mensual proyectado */}
        <Section icon={<DollarSign className="w-3.5 h-3.5" />} title="Abono Mensual Proyectado">
          <p className="text-xs text-slate-500 leading-relaxed -mt-1">
            Monto esperado para meses sin aporte real registrado.
          </p>
          <SliderInput
            id="abono-mensual"
            label="Abono proyectado"
            value={params.abonoMensual}
            onChange={(v) => onChange('abonoMensual', v)}
            min={0}
            max={20000000}
            step={100000}
            prefix="$"
            formatDisplay={(v) => `$${v.toLocaleString('es-CO')}`}
          />
          <NumberInput
            id="abono-mensual-num"
            label="Valor exacto"
            value={params.abonoMensual}
            onChange={(v) => onChange('abonoMensual', Math.max(0, v))}
            min={0}
            step={50000}
            prefix="$"
          />
        </Section>

        {/* Aportes Reales */}
        <Section icon={<ClipboardList className="w-3.5 h-3.5" />} title="Aportes Reales">
          <p className="text-xs text-slate-500 leading-relaxed -mt-1">
            Registra lo que realmente aportaste cada mes. Sobreescribe el proyectado para ese mes.
          </p>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <NumberInput
                  id="aporte-mes"
                  label="Mes"
                  value={nuevoAporte.mes}
                  onChange={(v) => setNuevoAporte((p) => ({ ...p, mes: Math.round(v) }))}
                  min={1}
                  max={params.plazoMeses}
                  step={1}
                />
                {currentMes && nuevoAporte.mes === currentMes && (
                  <p className="text-[10px] text-emerald-500/70 mt-1 pl-1">● Mes actual</p>
                )}
              </div>
              <NumberInput
                id="aporte-monto"
                label="Monto"
                value={nuevoAporte.monto}
                onChange={(v) => setNuevoAporte((p) => ({ ...p, monto: Math.max(0, v) }))}
                min={0}
                step={50000}
                prefix="$"
              />
            </div>
            <input
              type="text"
              placeholder="Nota (opcional)"
              value={nuevoAporte.nota}
              onChange={(e) => setNuevoAporte((p) => ({ ...p, nota: e.target.value }))}
              maxLength={60}
              aria-label="Nota del aporte"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/40 transition-all"
            />
            <button
              onClick={addAporte}
              disabled={nuevoAporte.mes < 1 || nuevoAporte.mes > params.plazoMeses}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all',
                'bg-blue-600 hover:bg-blue-500 text-white',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900'
              )}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              {aportes.find((a) => a.mes === nuevoAporte.mes) ? 'Actualizar aporte' : 'Registrar aporte'}
            </button>
          </div>

          {aportes.length > 0 && (
            <div className="space-y-1.5 mt-1" aria-label="Aportes registrados">
              {[...aportes].sort((a, b) => a.mes - b.mes).map((a) => (
                <div
                  key={a.id}
                  className="flex items-start justify-between py-1.5 px-3 rounded-lg bg-slate-800 border border-blue-500/20"
                >
                  <div className="text-xs min-w-0">
                    <span className="text-slate-400">Mes </span>
                    <span className="text-slate-200 font-semibold">{a.mes}</span>
                    <span className="text-slate-500 mx-1.5">·</span>
                    <span className={cn('font-semibold', a.monto > 0 ? 'text-blue-400' : 'text-slate-500')}>
                      {a.monto > 0 ? `$${a.monto.toLocaleString('es-CO')}` : 'Sin aporte'}
                    </span>
                    {a.nota && (
                      <p className="text-slate-500 mt-0.5 truncate">{a.nota}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeAporte(a.id)}
                    aria-label={`Eliminar aporte del mes ${a.mes}`}
                    className="p-1 ml-2 rounded text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0 focus:outline-none focus:ring-1 focus:ring-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Abonos Únicos */}
        <Section icon={<PlusCircle className="w-3.5 h-3.5" />} title="Abonos Únicos Planificados">
          <p className="text-xs text-slate-500 leading-relaxed -mt-1">
            Depósitos extra planificados en meses específicos (además del abono mensual).
          </p>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <NumberInput
                id="abono-mes"
                label="Mes"
                value={nuevoAbono.mes}
                onChange={(v) => setNuevoAbono((p) => ({ ...p, mes: Math.round(v) }))}
                min={1}
                max={params.plazoMeses}
                step={1}
              />
              <NumberInput
                id="abono-monto"
                label="Monto"
                value={nuevoAbono.monto}
                onChange={(v) => setNuevoAbono((p) => ({ ...p, monto: v }))}
                min={1}
                step={100}
                prefix="$"
              />
            </div>
            <button
              onClick={addAbonoUnico}
              disabled={!nuevoAbono.monto || nuevoAbono.mes < 1 || nuevoAbono.mes > params.plazoMeses}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all',
                'bg-emerald-600 hover:bg-emerald-500 text-white',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900'
              )}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Agregar abono único
            </button>
          </div>

          {params.abonosUnicos.length > 0 && (
            <div className="mt-1 space-y-1.5" aria-label="Abonos únicos registrados">
              {params.abonosUnicos.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-800 border border-slate-700"
                >
                  <div className="text-xs">
                    <span className="text-slate-400">Mes </span>
                    <span className="text-slate-200 font-semibold">{a.mes}</span>
                    <span className="text-slate-500 mx-1.5">·</span>
                    <span className="text-amber-400 font-semibold">
                      ${a.monto.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <button
                    onClick={() => removeAbonoUnico(a.id)}
                    aria-label={`Eliminar abono del mes ${a.mes}`}
                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors focus:outline-none focus:ring-1 focus:ring-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Datos */}
        <Section icon={<BarChart2 className="w-3.5 h-3.5" />} title="Datos">
          <p className="text-xs text-slate-500 leading-relaxed -mt-1">
            Exporta un respaldo o importa datos previamente guardados.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onExport}
              className={cn(
                'flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all',
                'bg-slate-700 hover:bg-slate-600 text-slate-200',
                'focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900'
              )}
            >
              <Download className="w-3.5 h-3.5" />
              Exportar
            </button>
            <label
              className={cn(
                'flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer',
                'bg-slate-700 hover:bg-slate-600 text-slate-200',
                'focus-within:ring-2 focus-within:ring-slate-500'
              )}
            >
              <Upload className="w-3.5 h-3.5" />
              Importar
              <input
                type="file"
                accept=".json"
                className="sr-only"
                onChange={handleImportFile}
              />
            </label>
          </div>
        </Section>

      </div>
    </aside>
  )
}

function Section({ icon, title, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-emerald-400">{icon}</span>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}
