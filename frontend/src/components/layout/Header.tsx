import React, { useContext } from 'react'
import { VitalsContext } from '../../context/VitalsContext'
import { useUptime } from '../../hooks/useUptime'

export function Header() {
  const uptime = useUptime()
  const context = useContext(VitalsContext)
  const connected = context?.state.connected ?? false
  const patientCount = Object.keys(context?.state.patients ?? {}).length

  return (
    <div className="h-16 bg-white border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-[14px] md:text-[16px] font-bold text-primary tracking-tight">VitalGrid</span>
        <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-status-stable animate-pulse-soft shadow-lg shadow-green-400' : 'bg-status-offline'}`}></div>
      </div>
      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden sm:flex text-[12px] md:text-[13px] text-secondary font-mono bg-gray-50 px-2 md:px-3 py-1.5 rounded-full border border-border">
          ⏱️ {uptime}
        </div>
        <div className="hidden sm:flex text-[12px] md:text-[13px] text-secondary font-medium bg-gray-50 px-2 md:px-3 py-1.5 rounded-full border border-border">
          👥 {patientCount} patients
        </div>
        <div className="sm:hidden text-[13px] text-secondary font-mono bg-gray-50 px-2 py-1.5 rounded-full border border-border">
          {patientCount}
        </div>
      </div>
    </div>
  )
}
