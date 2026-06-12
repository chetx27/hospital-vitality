import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VitalsContext } from '../../context/VitalsContext'
import { fmt } from '../../utils/format'

export function CriticalModal() {
  const context = useContext(VitalsContext)
  const navigate = useNavigate()
  const [isExiting, setIsExiting] = useState(false)
  
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && context?.state.criticalEvent) {
        handleDismiss()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [context])

  if (!context) return null

  const { criticalEvent } = context.state
  const { clearCritical } = context

  if (!criticalEvent) return null

  const { patient, alert } = criticalEvent

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      clearCritical()
      setIsExiting(false)
    }, 300)
  }

  const handleSentToReview = () => {
    setIsExiting(true)
    setTimeout(() => {
      clearCritical()
      setIsExiting(false)
    }, 300)
  }

  const handleViewPatient = () => {
    setIsExiting(true)
    setTimeout(() => {
      clearCritical()
      navigate(`/patient/${patient.patientId}`)
      setIsExiting(false)
    }, 300)
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isExiting ? 'opacity-0 translate-x-96' : 'opacity-100 translate-x-0'}`}
      onClick={e => e.stopPropagation()}
    >
      <div 
        className="w-[400px] bg-white border border-status-critical/30 rounded-lg overflow-hidden shadow-2xl"
      >
        <div className="h-1 w-full bg-gradient-to-r from-status-critical to-status-warning"></div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⚠️</span>
            <div className="text-[11px] uppercase tracking-wider text-status-critical font-bold">
              Critical Alert
            </div>
          </div>
          <div className="text-[16px] font-bold text-primary mb-3">
            {patient.name}
          </div>
          <div className="bg-red-50 border-l-4 border-status-critical p-3 rounded-sm mb-4">
            <div className="text-[13px] text-primary">
              <span className="font-semibold">{alert.vitalType.toUpperCase()}</span> is <span className="text-status-critical font-bold text-[14px]">{alert.value}</span>
            </div>
            <div className="text-[12px] text-secondary mt-1">
              Threshold: {alert.threshold}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button 
              className="px-4 py-2.5 border border-border rounded-md text-primary hover:bg-gray-50 active:bg-gray-100 transition-colors text-[13px] font-medium"
              onClick={handleDismiss}
            >
              Dismiss
            </button>
            <button 
              className="px-4 py-2.5 bg-status-warning text-primary rounded-md hover:opacity-90 active:opacity-80 transition-opacity text-[13px] font-bold"
              onClick={handleSentToReview}
            >
              Sent to Review
            </button>
            <button 
              className="px-4 py-2.5 bg-status-critical text-white rounded-md hover:bg-red-600 active:bg-red-700 transition-colors text-[13px] font-bold"
              onClick={handleViewPatient}
            >
              View Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
