import React, { useContext, useState } from 'react'
import { VitalsContext } from '../../context/VitalsContext'
import { fmt } from '../../utils/format'

export function AlertFeed() {
  const context = useContext(VitalsContext)
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<number>>(new Set())
  
  if (!context) return null
  const { alerts } = context.state

  const handleAcknowledge = (index: number) => {
    setAcknowledgedAlerts(prev => new Set(prev).add(index))
    setTimeout(() => {
      setAcknowledgedAlerts(prev => {
        const newSet = new Set(prev)
        newSet.delete(index)
        return newSet
      })
    }, 2000)
  }

  return (
    <div className="h-full bg-white border-l border-border flex flex-col overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-border shrink-0">
        <span className="text-[12px] uppercase tracking-widest text-muted font-bold">Alert Feed</span>
        <span className="px-3 py-1.5 rounded-lg bg-status-critical text-white text-xs font-bold">{alerts.length}</span>
      </div>
      <div className="flex-grow overflow-y-auto flex flex-col">
        {alerts.length === 0 ? (
          <div className="flex-grow flex items-center justify-center p-4">
            <span className="text-[13px] text-muted text-center">✓ No active alerts</span>
          </div>
        ) : (
          alerts.map((alert, i) => (
            <div 
              key={i} 
              className={`shrink-0 border-l-4 border-b border-b-border p-3 transition-all ${
                acknowledgedAlerts.has(i) ? 'bg-green-50 opacity-60' :
                alert.severity === 'critical' ? 'border-status-critical bg-red-50 hover:bg-red-100' : 'border-status-warning bg-yellow-50 hover:bg-yellow-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-grow min-w-0">
                  <div className="text-[13px] font-semibold text-primary truncate">
                    {alert.patientName}
                  </div>
                  <div className="text-[12px] text-secondary mt-0.5">
                    {alert.vitalType.toUpperCase()} → {alert.value}
                  </div>
                </div>
                <div className={`text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap ${
                  alert.severity === 'critical' ? 'bg-status-critical text-white' : 'bg-status-warning text-primary'
                }`}>
                  {alert.severity.toUpperCase()}
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 text-[11px] text-muted mb-2">
                <span>Threshold: {alert.threshold}</span>
                <span>{fmt.time(alert.timestamp)}</span>
              </div>
              <button
                onClick={() => handleAcknowledge(i)}
                className={`w-full px-2 py-1.5 text-[11px] font-semibold rounded transition-all ${
                  acknowledgedAlerts.has(i)
                    ? 'bg-status-stable text-white'
                    : 'bg-primary text-white hover:opacity-90 active:opacity-80'
                }`}
              >
                {acknowledgedAlerts.has(i) ? '✓ Acknowledged' : 'Acknowledge'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
