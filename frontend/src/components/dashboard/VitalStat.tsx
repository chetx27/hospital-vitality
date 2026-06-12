import React, { useEffect, useState } from 'react'
import { SparkLine } from './SparkLine'

interface Props {
  label: string
  value: string
  unit: string
  color: string
  history: number[]
  isAlert: boolean
}

export function VitalStat({ label, value, unit, color, history, isAlert }: Props) {
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    setFlash(true)
    const t = setTimeout(() => setFlash(false), 300)
    return () => clearTimeout(t)
  }, [value])

  // Calculate trend
  const getTrend = () => {
    if (history.length < 2) return null
    const recent = history.slice(-3)
    const avg1 = recent.slice(0, 1)[0]
    const avg2 = recent.slice(-1)[0]
    if (avg2 > avg1 + 1) return 'up'
    if (avg2 < avg1 - 1) return 'down'
    return 'stable'
  }

  const trend = getTrend()

  return (
    <div className="flex flex-col gap-2.5 p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-widest text-muted font-semibold">{label}</div>
        {trend && (
          <span className="text-xs font-bold">
            {trend === 'up' && <span className="text-orange-500">📈</span>}
            {trend === 'down' && <span className="text-red-500">📉</span>}
            {trend === 'stable' && <span className="text-green-500">→</span>}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span 
          className={`text-[28px] font-bold font-mono ${flash ? 'vital-update' : ''}`}
          style={{ color: isAlert ? 'var(--status-critical)' : color }}
        >
          {value}
        </span>
        <span className="text-xs text-muted font-mono">{unit}</span>
      </div>
      <SparkLine data={history} color={color} />
    </div>
  )
}
