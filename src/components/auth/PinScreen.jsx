import { useState, useRef, useEffect } from 'react'
import { TrendingUp, Lock, Eye, EyeOff } from 'lucide-react'
import { isPinSetup, setupPin, verifyPin } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export function PinScreen({ onUnlock }) {
  const isSetup = isPinSetup()
  // step: 'enter' | 'confirm'
  const [step, setStep] = useState('enter')
  const [value, setValue] = useState('')       // current input value
  const [savedPin, setSavedPin] = useState('') // pin from step 1 (frozen)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    // Small delay so the DOM settles before focusing on step change
    const t = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [step])

  async function handleSubmit(e) {
    e.preventDefault()
    if (value.length < 4) {
      setError('Mínimo 4 dígitos')
      return
    }
    setLoading(true)
    setError('')
    try {
      if (!isSetup) {
        if (step === 'enter') {
          // Save the entered pin and move to confirm
          setSavedPin(value)
          setValue('')
          setStep('confirm')
          setLoading(false)
          return
        }
        // Confirm step: compare against savedPin
        if (savedPin !== value) {
          setError('Los PINs no coinciden')
          setValue('')
          setLoading(false)
          return
        }
        await setupPin(savedPin)
        onUnlock()
      } else {
        const valid = await verifyPin(value)
        if (!valid) {
          setError('PIN incorrecto')
          setValue('')
          setLoading(false)
          return
        }
        onUnlock()
      }
    } catch {
      setError('Error inesperado')
      setLoading(false)
    }
  }

  const title = !isSetup
    ? step === 'enter'
      ? 'Crea tu PIN de acceso'
      : 'Confirma tu PIN'
    : 'Ingresa tu PIN'

  const subtitle = !isSetup
    ? step === 'enter'
      ? 'Este PIN protege tu información financiera'
      : 'Repite el PIN para confirmar'
    : 'Tu sesión está protegida'

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-8 space-y-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              {isSetup
                ? <Lock className="w-7 h-7 text-emerald-400" />
                : <TrendingUp className="w-7 h-7 text-emerald-400" />
              }
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-100">Rendimientos</h1>
              <p className="text-sm text-slate-400 mt-1">{title}</p>
              <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                ref={inputRef}
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value.replace(/\D/g, ''))
                  setError('')
                }}
                placeholder="••••"
                aria-label={title}
                aria-describedby={error ? 'pin-error' : undefined}
                className={cn(
                  'w-full bg-slate-800 border rounded-xl px-4 py-3.5 text-center text-2xl tracking-[0.5em] font-bold',
                  'text-slate-100 placeholder:text-slate-600 placeholder:tracking-normal placeholder:text-base',
                  'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent',
                  'transition-all pr-12',
                  error ? 'border-red-500/50 bg-red-500/5' : 'border-slate-700'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPin((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                aria-label={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p id="pin-error" className="text-red-400 text-xs text-center" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || value.length < 4}
              className={cn(
                'w-full py-3.5 rounded-xl font-semibold text-sm transition-all',
                'bg-emerald-600 hover:bg-emerald-500 text-white',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900'
              )}
            >
              {loading ? 'Verificando...' : step === 'confirm' ? 'Crear PIN' : 'Continuar'}
            </button>
          </form>

          {/* Setup step indicator */}
          {!isSetup && (
            <div className="flex justify-center gap-2 mt-6">
              <span className={cn('w-2 h-2 rounded-full transition-colors', step === 'enter' ? 'bg-emerald-400' : 'bg-slate-600')} />
              <span className={cn('w-2 h-2 rounded-full transition-colors', step === 'confirm' ? 'bg-emerald-400' : 'bg-slate-600')} />
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-700 mt-4">
          Los datos se guardan localmente en este navegador
        </p>
      </div>
    </div>
  )
}
