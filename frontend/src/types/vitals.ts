export interface PatientVitals {
  patientId: string
  name: string
  hr: number
  sysBP: number
  diaBP: number
  spo2: number
  temp: number
  timestamp: string
  alerts: AlertEvent[]
}

export interface AlertEvent {
  patientId?: string
  patientName?: string
  vitalType: string
  value: number
  threshold: number
  severity: 'warning' | 'critical'
}

export interface AnalyticsSummary {
  avgHr: number
  avgSpo2: number
  avgTemp: number
  totalProcessed: number
  totalAlerts: number
  criticalPatientId: string | null
}

export type PatientStatus = 'stable' | 'warning' | 'critical' | 'offline'
