import React, { useContext } from 'react'
import { VitalsContext } from '../../context/VitalsContext'

export function AnalyticsBar() {
  const context = useContext(VitalsContext)
  if (!context) return null
  const { analytics } = context.state

  if (!analytics) return <div className="h-20 bg-white border-b border-border"></div>

  return (
    <div className="h-auto md:h-20 bg-white border-b border-border flex flex-col md:flex-row items-center px-4 md:px-6 w-full shadow-sm py-4 md:py-0">
      <div className="grid grid-cols-2 md:grid-cols-4 w-full md:gap-6 gap-4 md:divide-x md:divide-border">
        <div className="flex flex-col px-0 md:px-6 justify-center hover:bg-gray-50 rounded transition-colors py-2">
          <span className="text-[10px] md:text-[11px] uppercase text-muted tracking-widest font-semibold">Avg Heart Rate</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[20px] md:text-[22px] font-bold text-accent-blue font-mono">{analytics.avgHr}</span>
            <span className="text-xs text-muted font-mono">bpm</span>
          </div>
        </div>
        <div className="flex flex-col px-0 md:px-6 justify-center hover:bg-gray-50 rounded transition-colors py-2">
          <span className="text-[10px] md:text-[11px] uppercase text-muted tracking-widest font-semibold">Avg SpO₂</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[20px] md:text-[22px] font-bold text-accent-cyan font-mono">{analytics.avgSpo2}</span>
            <span className="text-xs text-muted font-mono">%</span>
          </div>
        </div>
        <div className="flex flex-col px-0 md:px-6 justify-center hover:bg-gray-50 rounded transition-colors py-2">
          <span className="text-[10px] md:text-[11px] uppercase text-muted tracking-widest font-semibold">Avg Temp</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[20px] md:text-[22px] font-bold text-accent-orange font-mono">{analytics.avgTemp}</span>
            <span className="text-xs text-muted font-mono">°C</span>
          </div>
        </div>
        <div className="flex flex-col px-0 md:px-6 justify-center hover:bg-gray-50 rounded transition-colors py-2">
          <span className="text-[10px] md:text-[11px] uppercase text-muted tracking-widest font-semibold">Total Alerts</span>
          <span className={`text-[20px] md:text-[22px] font-bold font-mono ${analytics.totalAlerts > 0 ? 'text-status-critical' : 'text-primary'}`}>
            {analytics.totalAlerts}
          </span>
        </div>
      </div>
    </div>
  )
}
