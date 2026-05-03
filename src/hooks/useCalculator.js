import { useMemo } from 'react'

export function useCalculator({
  capitalInicial,
  tasaMensual,
  plazoMeses,
  abonoMensual,
  abonosUnicos,
  aportes = [],
}) {
  return useMemo(() => {
    const rate = tasaMensual / 100
    let balance = capitalInicial
    const rows = []
    let totalAbonos = capitalInicial
    let totalIntereses = 0

    for (let mes = 1; mes <= plazoMeses; mes++) {
      const interes = balance * rate

      const abonoUnico = abonosUnicos
        .filter((a) => a.mes === mes)
        .reduce((sum, a) => sum + (a.monto || 0), 0)

      // Aportes reales sobreescriben el abono proyectado para ese mes
      const aporteReal = aportes.find((a) => a.mes === mes)
      const abonoEfectivo = aporteReal !== undefined ? aporteReal.monto : abonoMensual

      balance += interes + abonoEfectivo + abonoUnico
      totalAbonos += abonoEfectivo + abonoUnico
      totalIntereses += interes

      rows.push({
        mes,
        interes: parseFloat(interes.toFixed(2)),
        abono: abonoEfectivo + abonoUnico,
        abonoMensual: abonoEfectivo,
        abonoUnico: abonoUnico,
        balance: parseFloat(balance.toFixed(2)),
        totalInteresesAcumulados: parseFloat(totalIntereses.toFixed(2)),
        esReal: aporteReal !== undefined,
      })
    }

    const roi = capitalInicial > 0 ? (totalIntereses / capitalInicial) * 100 : 0

    return {
      rows,
      resumen: {
        balanceFinal: parseFloat(balance.toFixed(2)),
        totalAbonos: parseFloat(totalAbonos.toFixed(2)),
        totalIntereses: parseFloat(totalIntereses.toFixed(2)),
        rendimientoTotal: parseFloat(totalIntereses.toFixed(2)),
        roi: parseFloat(roi.toFixed(2)),
      },
    }
  }, [capitalInicial, tasaMensual, plazoMeses, abonoMensual, abonosUnicos, aportes])
}
