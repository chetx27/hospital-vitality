import React, { useContext, useState } from 'react'
import { VitalsContext } from '../context/VitalsContext'
import { PatientCard } from '../components/dashboard/PatientCard'
import { AnalyticsBar } from '../components/dashboard/AnalyticsBar'
import { AlertFeed } from '../components/dashboard/AlertFeed'

export function Dashboard() {
  const context = useContext(VitalsContext)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  if (!context) return null
  const { patients, histories } = context.state

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-gray-50">
      <AnalyticsBar />
      <div className="flex-grow flex overflow-hidden">
        <div className="flex-grow overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {Object.values(patients).map(p => (
              <PatientCard key={p.patientId} patient={p} history={histories[p.patientId] || []} />
            ))}
          </div>
        </div>
        <div className="hidden lg:flex w-[340px] shrink-0 border-l border-border bg-white flex-col">
          <AlertFeed />
        </div>
      </div>
    </div>
  )
}
