import React, { useContext, useEffect, useState } from 'react'
import { VitalsContext } from '../../context/VitalsContext'
import { AlertEvent } from '../../types/vitals'

export function ToastNotifier() {
  const context = useContext(VitalsContext)
  if (!context) return null
  const { alerts } = context.state

  const [toasts, setToasts] = useState<AlertEvent[]>([])

  useEffect(() => {
    if (alerts.length > 0) {
      const newest = alerts[0]
      setToasts(current => {
        if (!current.find(t => t.patientId === newest.patientId && t.timestamp === newest.timestamp)) {
          return [newest, ...current].slice(0, 3)
        }
        return current
      })
    }
  }, [alerts])

  return (
    <div className="fixed top-4 right-4 z-40 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast, i) => (
        <Toast key={`${toast.patientId}-${toast.timestamp}-${i}`} toast={toast} onDismiss={() => {
          setToasts(current => current.filter(t => t !== toast))
        }} />
      ))}
    </div>
  )
}

function Toast({ toast, onDismiss }: { toast: AlertEvent, onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div className="w-[280px] bg-elevated border border-border rounded-lg overflow-hidden pointer-events-auto relative shadow-xl transition-transform animate-[slideIn_200ms_ease]">
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${toast.severity === 'critical' ? 'bg-status-critical' : 'bg-status-warning'}`}></div>
      <div className="p-3 pl-4 pr-8 relative">
        <button onClick={onDismiss} className="absolute top-2 right-2 text-muted hover:text-primary">✕</button>
        <div className="text-[13px] font-medium text-primary">{toast.patientName}</div>
        <div className="text-[12px] text-secondary mt-1">
          {toast.vitalType.toUpperCase()} is {toast.value} (Limit: {toast.threshold})
        </div>
      </div>
      <div className="h-[2px] bg-border w-full">
        <div className="h-full bg-text-muted origin-left animate-[shrink_4000ms_linear_forwards]"></div>
      </div>
    </div>
  )
}
