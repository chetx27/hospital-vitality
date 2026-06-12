import { PatientVitals, PatientStatus } from '../types/vitals'

export function getPatientStatus(v: PatientVitals | undefined | null): PatientStatus {
  if (!v) return 'offline'
  if (v.alerts && v.alerts.some(a => a.severity === 'critical')) return 'critical'
  if (v.alerts && v.alerts.some(a => a.severity === 'warning')) return 'warning'
  return 'stable'
}

export const VITAL_THRESHOLDS = {
  hr:    { low: 60,   high: 100,  unit: 'bpm',  label: 'Heart Rate',  color: '#3B82F6' },
  sysBP: { low: 90,   high: 130,  unit: 'mmHg', label: 'Systolic BP', color: '#8B5CF6' },
  spo2:  { low: 95,   high: 100,  unit: '%',    label: 'SpO2',        color: '#06B6D4' },
  temp:  { low: 36.0, high: 37.5, unit: '°C',   label: 'Temperature', color: '#F97316' },
}
