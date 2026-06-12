import React, { useContext, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { VitalsContext } from '../../context/VitalsContext'
import { getPatientStatus } from '../../utils/thresholds'

export function Sidebar() {
  const context = useContext(VitalsContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all'|'critical'|'warning'|'stable'>('all')
  const [sortBy, setSortBy] = useState<'status'|'name'|'recent'>('status')
  
  if (!context) return null
  
  const { patients, analytics } = context.state
  const patientList = Object.values(patients)

  const filtered = useMemo(() => {
    let result = patientList.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
      const status = getPatientStatus(p)
      const matchesFilter = statusFilter === 'all' || status === statusFilter
      return matchesSearch && matchesFilter
    })

    // Sort
    if (sortBy === 'status') {
      result.sort((a, b) => {
        const statusOrder = { critical: 0, warning: 1, stable: 2, offline: 3 }
        return statusOrder[getPatientStatus(a)] - statusOrder[getPatientStatus(b)]
      })
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    }

    return result
  }, [patientList, searchTerm, statusFilter, sortBy])

  return (
    <div className="hidden md:flex md:w-[280px] lg:w-[300px] h-full bg-white border-r border-border flex flex-col shrink-0 shadow-sm">
      {/* Search Bar */}
      <div className="p-4 border-b border-border shrink-0">
        <input
          type="text"
          placeholder="🔍 Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-[13px] border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue bg-gray-50"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-3 border-b border-border shrink-0 overflow-x-auto">
        {(['all', 'critical', 'warning', 'stable'] as const).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-2.5 py-1.5 text-[11px] font-semibold uppercase whitespace-nowrap rounded transition-all ${
              statusFilter === status
                ? status === 'critical' ? 'bg-status-critical text-white' : 
                  status === 'warning' ? 'bg-status-warning text-primary' :
                  status === 'stable' ? 'bg-status-stable text-white' :
                  'bg-primary text-white'
                : 'bg-gray-100 text-secondary hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {/* Sort Options */}
      <div className="px-3 py-2 border-b border-border shrink-0">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="w-full text-[12px] px-2 py-1.5 border border-border rounded bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-blue"
        >
          <option value="status">Sort: Status (Critical First)</option>
          <option value="name">Sort: Name (A-Z)</option>
          <option value="recent">Sort: Recent Changes</option>
        </select>
      </div>

      {/* Patient List */}
      <div className="flex-grow overflow-y-auto flex flex-col">
        {filtered.length === 0 ? (
          <div className="flex-grow flex items-center justify-center p-4">
            <span className="text-[13px] text-muted text-center">No patients found</span>
          </div>
        ) : (
          filtered.map(p => {
            const status = getPatientStatus(p)
            const dotColor = status === 'stable' ? 'bg-status-stable' : 
                             status === 'warning' ? 'bg-status-warning' : 
                             status === 'critical' ? 'bg-status-critical' : 'bg-status-offline'
            const isActive = location.pathname === `/patient/${p.patientId}`
            
            return (
              <div 
                key={p.patientId}
                onClick={() => navigate(`/patient/${p.patientId}`)}
                className={`px-3 py-3 flex items-center gap-3 cursor-pointer transition-all border-l-4 ${
                  isActive 
                    ? 'bg-blue-50 border-l-accent-blue text-primary' 
                    : `border-l-transparent hover:bg-gray-50 text-secondary`
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${dotColor} flex-shrink-0`}></div>
                <div className="flex-grow min-w-0">
                  <div className={`text-[13px] font-medium truncate ${isActive ? 'text-primary' : ''}`}>{p.name}</div>
                  <div className="text-[11px] text-muted">{p.patientId}</div>
                </div>
                <div className={`text-[11px] font-bold px-2 py-0.5 rounded whitespace-nowrap ${
                  status === 'critical' ? 'bg-red-100 text-status-critical' :
                  status === 'warning' ? 'bg-yellow-100 text-status-warning' :
                  status === 'stable' ? 'bg-green-100 text-status-stable' :
                  'bg-gray-100 text-status-offline'
                }`}>
                  {status}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* System Status Footer */}
      <div className="border-t border-border p-3 bg-gray-50 shrink-0">
        <div className="text-[10px] uppercase tracking-widest text-muted font-bold mb-2">System Status</div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-secondary">Kafka Consumers</span>
            <span className="w-2 h-2 rounded-full bg-status-stable animate-pulse"></span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-secondary">Queue Depth</span>
            <span className="text-[12px] font-mono text-primary">{analytics?.totalAlerts || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
