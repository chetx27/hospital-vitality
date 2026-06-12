import React from 'react'
import { PatientStatus } from '../../types/vitals'

export function StatusBadge({ status }: { status: PatientStatus }) {
  let colorClass = ''
  let text = status
  switch (status) {
    case 'stable':
      colorClass = 'border-status-stable text-status-stable'
      break
    case 'warning':
      colorClass = 'border-status-warning text-status-warning'
      break
    case 'critical':
      colorClass = 'border-status-critical text-status-critical animate-pulse-soft'
      break
    case 'offline':
      colorClass = 'border-text-muted text-muted'
      break
  }

  return (
    <div className={`px-2.5 py-1.5 border rounded bg-transparent uppercase text-[11px] font-medium leading-none tracking-widest ${colorClass}`}>
      {text}
    </div>
  )
}
