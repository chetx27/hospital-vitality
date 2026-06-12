import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PatientVitals } from '../../types/vitals'
import { getPatientStatus, VITAL_THRESHOLDS } from '../../utils/thresholds'
import { StatusBadge } from '../ui/StatusBadge'
import { VitalStat } from './VitalStat'
import { fmt } from '../../utils/format'

export function PatientCard({ patient, history }: { patient: PatientVitals, history: PatientVitals[] }) {
  const navigate = useNavigate()
  const status = getPatientStatus(patient)

  const getAlert = (type: string) => patient?.alerts?.some(a => a.vitalType === type) || false
  const historyMap = {
    hr: history.map(h => h.hr),
    sysBP: history.map(h => h.sysBP),
    spo2: history.map(h => h.spo2),
    temp: history.map(h => h.temp)
  }

  const stripColor = status === 'stable' ? 'bg-status-stable' : 
                     status === 'warning' ? 'bg-status-warning' : 
                     status === 'critical' ? 'bg-status-critical' : 'bg-transparent'
  
  const borderColor = status === 'stable' ? 'border-status-stable' : 
                      status === 'warning' ? 'border-status-warning' : 
                      status === 'critical' ? 'border-status-critical' : 'border-border'
  
  const headerBg = status === 'critical' ? 'bg-red-50' :
                   status === 'warning' ? 'bg-yellow-50' :
                   status === 'stable' ? 'bg-green-50' : 'bg-white'

  return (
    <div 
      className={`bg-surface border-2 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 flex flex-col h-full shadow-sm ${borderColor}`}
      onClick={() => navigate(`/patient/${patient.patientId}`)}
    >
      <div className={`h-1 w-full ${stripColor}`}></div>
      <div className={`p-5 border-b border-border flex justify-between items-start ${headerBg}`}>
        <div>
          <div className="text-[14px] font-bold text-primary tracking-tight">{patient.name}</div>
          <div className="text-[12px] font-mono text-muted mt-1">{patient.patientId}</div>
        </div>
        <div className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase ${
          status === 'critical' ? 'bg-status-critical text-white' :
          status === 'warning' ? 'bg-status-warning text-primary' :
          status === 'stable' ? 'bg-status-stable text-white' :
          'bg-status-offline text-white'
        }`}>
          {status}
        </div>
      </div>

      <div className="grid grid-cols-2 flex-grow divide-x divide-border divide-y">
        <div>
          <VitalStat 
            label={VITAL_THRESHOLDS.hr.label}
            value={fmt.hr(patient.hr)}
            unit={VITAL_THRESHOLDS.hr.unit}
            color={VITAL_THRESHOLDS.hr.color}
            history={historyMap.hr}
            isAlert={getAlert('hr')}
          />
        </div>
        <div>
          <VitalStat 
            label={VITAL_THRESHOLDS.sysBP.label}
            value={fmt.bp(patient.sysBP, patient.diaBP)}
            unit={VITAL_THRESHOLDS.sysBP.unit}
            color={VITAL_THRESHOLDS.sysBP.color}
            history={historyMap.sysBP}
            isAlert={getAlert('sysBP')}
          />
        </div>
        <div>
          <VitalStat 
            label={VITAL_THRESHOLDS.spo2.label}
            value={fmt.spo2(patient.spo2)}
            unit={VITAL_THRESHOLDS.spo2.unit}
            color={VITAL_THRESHOLDS.spo2.color}
            history={historyMap.spo2}
            isAlert={getAlert('spo2')}
          />
        </div>
        <div>
          <VitalStat 
            label={VITAL_THRESHOLDS.temp.label}
            value={fmt.temp(patient.temp)}
            unit={VITAL_THRESHOLDS.temp.unit}
            color={VITAL_THRESHOLDS.temp.color}
            history={historyMap.temp}
            isAlert={getAlert('temp')}
          />
        </div>
      </div>
      <div className={`h-[8px] w-full ${stripColor}`}></div>
    </div>
  )
}
