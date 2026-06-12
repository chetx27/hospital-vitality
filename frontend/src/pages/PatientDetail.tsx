import React, { useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { VitalsContext } from '../context/VitalsContext'
import { getPatientStatus, VITAL_THRESHOLDS } from '../utils/thresholds'
import { StatusBadge } from '../components/ui/StatusBadge'
import { VitalStat } from '../components/dashboard/VitalStat'
import { fmt } from '../utils/format'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, ReferenceLine } from 'recharts'

export function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const context = useContext(VitalsContext)
  if (!context || !id) return null

  const patient = context.state.patients[id]
  const history = context.state.histories[id] || []

  if (!patient) return <div className="p-4 text-primary">Loading...</div>

  const status = getPatientStatus(patient)
  const getAlert = (type: string) => patient.alerts?.some(a => a.vitalType === type) || false
  const historyMap = {
    hr: history.map(h => h.hr),
    sysBP: history.map(h => h.sysBP),
    spo2: history.map(h => h.spo2),
    temp: history.map(h => h.temp)
  }

  const patientAlerts = context.state.alerts.filter(a => a.patientId === id)

  const renderChart = (key: 'hr'|'sysBP'|'spo2'|'temp', dataKey: string, color: string, thresholdHigh: number, thresholdLow: number, domain: [number, number]) => {
    const data = history.map(h => ({
      time: fmt.time(h.timestamp).split(' ')[0],
      val: h[key]
    }))

    return (
      <div className="mb-6">
        <div className="text-[12px] uppercase text-muted mb-2 tracking-widest">{VITAL_THRESHOLDS[key].label}</div>
        <div className="h-[120px] w-full bg-surface border border-border rounded-lg p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="time" hide />
              <YAxis domain={domain} hide />
              <ReferenceLine y={thresholdHigh} stroke={color} strokeDasharray="3 3" strokeOpacity={0.4} />
              <ReferenceLine y={thresholdLow} stroke={color} strokeDasharray="3 3" strokeOpacity={0.4} />
              <Line type="monotone" dataKey="val" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-[900px] mx-auto p-6">
        <button onClick={() => navigate('/')} className="text-[13px] text-secondary hover:text-primary mb-4">
          ← All Patients
        </button>
        
        <div className="flex items-center gap-4 mb-6 border-b border-border pb-4">
          <h1 className="text-[20px] font-semibold text-primary">{patient.name}</h1>
          <StatusBadge status={status} />
          <span className="text-[12px] text-muted ml-auto font-mono">Updated {fmt.time(patient.timestamp)}</span>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-surface border border-border rounded-xl">
            <VitalStat label={VITAL_THRESHOLDS.hr.label} value={fmt.hr(patient.hr)} unit={VITAL_THRESHOLDS.hr.unit} color={VITAL_THRESHOLDS.hr.color} history={historyMap.hr} isAlert={getAlert('hr')} />
          </div>
          <div className="bg-surface border border-border rounded-xl">
            <VitalStat label={VITAL_THRESHOLDS.sysBP.label} value={fmt.bp(patient.sysBP, patient.diaBP)} unit={VITAL_THRESHOLDS.sysBP.unit} color={VITAL_THRESHOLDS.sysBP.color} history={historyMap.sysBP} isAlert={getAlert('sysBP')} />
          </div>
          <div className="bg-surface border border-border rounded-xl">
            <VitalStat label={VITAL_THRESHOLDS.spo2.label} value={fmt.spo2(patient.spo2)} unit={VITAL_THRESHOLDS.spo2.unit} color={VITAL_THRESHOLDS.spo2.color} history={historyMap.spo2} isAlert={getAlert('spo2')} />
          </div>
          <div className="bg-surface border border-border rounded-xl">
            <VitalStat label={VITAL_THRESHOLDS.temp.label} value={fmt.temp(patient.temp)} unit={VITAL_THRESHOLDS.temp.unit} color={VITAL_THRESHOLDS.temp.color} history={historyMap.temp} isAlert={getAlert('temp')} />
          </div>
        </div>

        {renderChart('hr', 'hr', VITAL_THRESHOLDS.hr.color, VITAL_THRESHOLDS.hr.high, VITAL_THRESHOLDS.hr.low, [40, 140])}
        {renderChart('sysBP', 'sysBP', VITAL_THRESHOLDS.sysBP.color, VITAL_THRESHOLDS.sysBP.high, VITAL_THRESHOLDS.sysBP.low, [60, 180])}
        {renderChart('spo2', 'spo2', VITAL_THRESHOLDS.spo2.color, VITAL_THRESHOLDS.spo2.high, VITAL_THRESHOLDS.spo2.low, [80, 100])}
        {renderChart('temp', 'temp', VITAL_THRESHOLDS.temp.color, VITAL_THRESHOLDS.temp.high, VITAL_THRESHOLDS.temp.low, [35, 40])}

        <div className="mt-8">
          <div className="text-[12px] uppercase text-muted mb-4 tracking-widest">Alert History</div>
          <div className="flex flex-col gap-2">
            {patientAlerts.map((a, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-surface border border-border rounded-lg">
                <div className={`w-[3px] h-full ${a.severity === 'critical' ? 'bg-status-critical' : 'bg-status-warning'} self-stretch rounded`}></div>
                <div className="flex-grow">
                  <div className="text-[13px] text-primary">{a.vitalType.toUpperCase()} {a.value} (Threshold: {a.threshold})</div>
                  <div className="text-[11px] text-muted font-mono">{fmt.time(a.timestamp)}</div>
                </div>
                <div className={`text-[11px] uppercase tracking-widest ${a.severity === 'critical' ? 'text-status-critical' : 'text-status-warning'}`}>
                  {a.severity}
                </div>
              </div>
            ))}
            {patientAlerts.length === 0 && <div className="text-sm text-muted">No alerts recorded.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
